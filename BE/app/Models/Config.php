<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Config extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get config value with proper type casting
     */
    public function getValueAttribute($value)
    {
        if ($value === null) {
            return null;
        }

        return match ($this->type) {
            'integer', 'int' => (int) $value,
            'boolean', 'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json', 'array' => json_decode($value, true),
            'float', 'double' => (float) $value,
            default => $value,
        };
    }

    /**
     * Set config value with proper type handling
     */
    public function setValueAttribute($value)
    {
        if ($this->type === 'json' || $this->type === 'array') {
            $this->attributes['value'] = is_string($value) ? $value : json_encode($value);
        } else {
            $this->attributes['value'] = $value;
        }
    }

    /**
     * Scope to get active configs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get configs by group
     */
    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }
}
