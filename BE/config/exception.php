<?php

use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;

if (!defined('DATA_NOT_FOUND_MESSAGE')) define('DATA_NOT_FOUND_MESSAGE', 'Data not found.');
if (!defined('INTERNAL_SERVER_ERROR_MESSAGE')) define('INTERNAL_SERVER_ERROR_MESSAGE', 'Internal server error.');
if (!defined('UNAUTHORIZED_MESSAGE')) define('UNAUTHORIZED_MESSAGE', 'Unauthorized.');
if (!defined('INVALID_CREDENTIALS_MESSAGE')) define('INVALID_CREDENTIALS_MESSAGE', 'Email or password is invalid.');
if (!defined('TOKEN_EXPIRED_MESSAGE')) define('TOKEN_EXPIRED_MESSAGE', 'Token expired.');
if (!defined('SCHEDULE_EXIST_MESSAGE')) define('SCHEDULE_EXIST_MESSAGE', 'Schedule already exists for this room on the selected date and time.');
if (!defined('ATTENDANCE_ERROR_MESSAGE')) define('ATTENDANCE_ERROR_MESSAGE', 'Attendance error.');
if (!defined('INVALID_QR_CODE_MESSAGE')) define('INVALID_QR_CODE_MESSAGE', 'Invalid QR code.');
if (!defined('ALREADY_ATTENDANCE_MESSAGE')) define('ALREADY_ATTENDANCE_MESSAGE', 'You have already attended this class.');
if (!defined('STUDENT_NOT_IN_CLASS_MESSAGE')) define('STUDENT_NOT_IN_CLASS_MESSAGE', 'You are not in this class.');
if (!defined('TIME_NOT_AVAILABLE_MESSAGE')) define('TIME_NOT_AVAILABLE_MESSAGE', 'Time not available.');
if (!defined('FORBIDDEN_MESSAGE')) define('FORBIDDEN_MESSAGE', 'Forbidden. You do not have permission to access.');
if (!defined('PASSWORD_MISMATCH_MESSAGE')) define('PASSWORD_MISMATCH_MESSAGE', 'The new password and confirmation password do not match.');
if (!defined('CURRENT_PASSWORD_INVALID_MESSAGE')) define('CURRENT_PASSWORD_INVALID_MESSAGE', 'Current password is invalid.');

if (!function_exists('getStatusCode')) {
function getStatusCode(Throwable $exception): int
{
    if ($exception instanceof HttpException) {
        return $exception->getStatusCode();
    } elseif ($exception instanceof ValidationException) {
        return 422;
    } elseif ($exception instanceof AuthenticationException) {
        return 401;
    } elseif ($exception instanceof NotFoundHttpException) {
        return 404;
    }
    return 500;
}
}
