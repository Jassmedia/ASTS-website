<?php
/**
 * Plugin Name: ASTS front-end proxy support
 * Description: Lets WordPress run behind the new aststraining.com front end (Vercel), which forwards
 *              logged-in sessions, forms, comments, LearnPress, search, feeds and sitemaps to WordPress
 *              on the same public domain. Install ONLY at the domain switch (see MIGRATION-NOTES.md).
 *
 * Install: copy this file to wp-content/mu-plugins/asts-proxy.php and add to wp-config.php
 *   define( 'ASTS_PROXY_SECRET', '<the same value as WP_PROXY_SECRET in Vercel>' );
 *
 * When a request carries the matching X-ASTS-Proxy-Secret header, WordPress treats it as a request
 * to the public host (https://aststraining.com) from the real visitor IP, so canonical redirects,
 * login cookies, nonces and IP-based tools behave exactly as they do today. Requests without the
 * secret are left untouched.
 */

if ( ! defined( 'ASTS_PROXY_SECRET' ) || '' === ASTS_PROXY_SECRET ) {
	return;
}

$asts_secret = isset( $_SERVER['HTTP_X_ASTS_PROXY_SECRET'] ) ? (string) $_SERVER['HTTP_X_ASTS_PROXY_SECRET'] : '';
if ( '' === $asts_secret || ! hash_equals( ASTS_PROXY_SECRET, $asts_secret ) ) {
	return;
}

if ( ! empty( $_SERVER['HTTP_X_FORWARDED_HOST'] ) ) {
	$_SERVER['HTTP_HOST'] = preg_replace( '/[^a-z0-9.\-:]/i', '', (string) $_SERVER['HTTP_X_FORWARDED_HOST'] );
}
if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && 'https' === $_SERVER['HTTP_X_FORWARDED_PROTO'] ) {
	$_SERVER['HTTPS'] = 'on';
}
if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
	$asts_ip = trim( explode( ',', (string) $_SERVER['HTTP_X_FORWARDED_FOR'] )[0] );
	if ( filter_var( $asts_ip, FILTER_VALIDATE_IP ) ) {
		$_SERVER['REMOTE_ADDR'] = $asts_ip;
	}
}
unset( $asts_secret, $asts_ip );
