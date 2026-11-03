<?php

namespace App\Enums;

enum QuoteTypeEnum: string
{
    case NOTIFICATION = 'notification';
    case COMMENT_SUGGESTION = 'comment_suggestion';
    case TIP = 'tip';
    case GREETING = 'greeting';
    case MOTIVATIONAL = 'motivational';
    case INSPIRATIONAL = 'inspirational';
    case FUNNY = 'funny';
    case WISDOM = 'wisdom';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

