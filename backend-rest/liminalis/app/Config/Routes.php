<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// --- AUTH & PUBLIC ---
$routes->match(['post', 'options'], 'register', 'RegisterController::createUser');
$routes->match(['post', 'options'], 'login', 'LoginController::login');
$routes->match(['get', 'post', 'options'], 'logout', 'LoginController::logout');
$routes->match(['post', 'options'], 'refresh', 'LoginController::refresh');
$routes->match(['get', 'options'], 'searchUsers', 'ProfileController::searchUsers');

// --- PROFILE SECTION (ORDER IS CRITICAL HERE) ---

// JWT Protected "Me" routes
$routes->match(['get', 'options'], 'profile', 'ProfileController::getProfile', ['filter' => 'jwt']);
$routes->match(['post', 'options'], 'profile', 'ProfileController::updateProfile', ['filter' => 'jwt']);

// Specific Static Sub-routes (MUST be above (:segment))
$routes->match(['get', 'options'], 'profile/invite-search', 'ProfileController::searchFollowersForInvite', ['filter' => 'jwt']);
$routes->match(['post', 'options'], 'profile/changePassword', 'UserSettingsController::changePassword', ['filter' => 'jwt']);

// Dynamic Slug Routes
// Anything that matches profile/something_else will fall here
$routes->match(['get', 'options'], 'profile/(:segment)', 'ProfileController::getProfileBySlug/$1');
$routes->match(['post', 'options'], 'profile/toggleFollow/(:segment)', 'ProfileController::toggleFollow/$1', ['filter' => 'jwt']);
$routes->match(['get', 'options'], 'profile/(:segment)/followers', 'ProfileController::getFollowers/$1', ['filter' => 'jwt']);
$routes->match(['get', 'options'], 'profile/(:segment)/following', 'ProfileController::getFollowing/$1', ['filter' => 'jwt']);


// --- SETTINGS ---
$routes->match(['get', 'options'], 'settings', 'UserSettingsController::index', ['filter' => 'jwt']);
$routes->match(['post', 'options'], 'settings', 'UserSettingsController::save', ['filter' => 'jwt']);


// --- POSTS ---
$routes->match(['post', 'options'], 'posts', 'PostsController::create', ['filter' => 'jwt']);
$routes->match(['get', 'options'], 'posts/(:num)', 'PostsController::show/$1');
$routes->match(['get', 'options'], 'posts/user/(:segment)', 'PostsController::getUserPosts/$1');
$routes->match(['post', 'options'], 'posts/upload-image', 'PostsController::uploadImage', ['filter' => 'jwt']);
$routes->match(['get', 'options'], 'posts/feed', 'PostsController::feed');


// --- LIKES ---
$routes->match(['post', 'options'], 'posts/(:num)/toggle-like', 'LikesController::toggle/$1', ['filter' => 'jwt']);
$routes->match(['get', 'options'], 'post/(:num)/likes', 'LikesController::status/$1', ['filter' => 'jwt']);


// --- CHATS ---
$routes->group('chats', ['filter' => 'jwt'], function ($routes) {
    $routes->group('invitations', function ($routes) {
        $routes->match(['get', 'options'], 'by-chat/(:num)', 'ChatController::showInvitationByChat/$1');
        $routes->match(['post', 'options'], '(:num)/accept', 'ChatController::acceptInvitation/$1');
        $routes->match(['post', 'options'], '(:num)/reject', 'ChatController::rejectInvitation/$1');
        $routes->match(['get', 'options'], 'my', 'ChatController::myInvitations');
    });
    $routes->match(['get', 'options'], '/', 'ChatController::index');
    $routes->match(['post', 'options'], '/', 'ChatController::create');
    $routes->match(['post', 'options'], 'group', 'ChatController::createGroup');
    $routes->match(['get', 'options'], 'public', 'ChatController::publicGroups');
    $routes->match(['get', 'options'], 'invitations', 'ChatController::myInvitations');

    $routes->match(['get', 'options'], '(:num)', 'ChatController::show/$1');
    $routes->match(['post', 'options'], '(:num)/join', 'ChatController::join/$1');
    $routes->match(['post', 'options'], '(:num)/leave', 'ChatController::leave/$1');
    $routes->match(['post', 'options'], '(:num)/invite', 'ChatController::inviteUser/$1');
    $routes->match(['get', 'options'], '(:num)/messages', 'ChatController::messages/$1');
    $routes->match(['post', 'options'], '(:num)/message', 'ChatController::sendMessage/$1');
    $routes->match(['delete', 'options'], '(:num)/messages/(:num)', 'ChatController::deleteMessage/$1/$2');
    $routes->match(['post', 'options'], '(:num)/read', 'ChatController::read/$1');
    $routes->match(['post', 'options'], 'private/(:num)', 'ChatController::createPrivate/$1');

});


// --- ADMIN ---
$routes->group('admin', ['filter' => ['jwt', 'admin']], function ($routes) {
    $routes->match(['get', 'options'], 'users', 'AdminController::listUsers');
    $routes->match(['post', 'options'], 'users/(:num)/toggle-ban', 'AdminController::toggleBan/$1');
    $routes->match(['post', 'options'], 'users/(:num)/promote', 'AdminController::promote/$1');
    $routes->match(['get', 'options'], 'posts', 'AdminController::listAllPosts');
    $routes->match(['delete', 'options'], 'posts/(:num)', 'AdminController::deletePost/$1');
});

$routes->match(['get', 'options'], 'auth/ws-validate', 'WsValidateController::wsValidate');