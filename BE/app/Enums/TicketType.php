<?php

namespace App\Enums;

enum TicketType: int
{
    case Feature = 0;
    case Bug = 1;
    case Complaint = 2;
    case Feedback = 3;
    case Other = 4;

    public function label(): string
    {
        return match ($this) {
            self::Feature => 'Đề xuất tính năng',
            self::Bug => 'Báo lỗi ứng dụng',
            self::Complaint => 'Phàn nàn / Trải nghiệm',
            self::Feedback => 'Góp ý chung',
            self::Other => 'Khác',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Feature => 'fa-solid fa-lightbulb',
            self::Bug => 'fa-solid fa-bug',
            self::Complaint => 'fa-solid fa-circle-exclamation',
            self::Feedback => 'fa-solid fa-comment-dots',
            self::Other => 'fa-solid fa-circle-question',
        };
    }
}
