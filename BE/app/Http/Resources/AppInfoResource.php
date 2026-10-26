<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * AppInfoResource
 *
 * Chuẩn hóa response cho thông tin ứng dụng (public, không nhạy cảm).
 */
class AppInfoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'name'            => $this->resource['name'],
            'version'         => $this->resource['version'],
            'environment'     => $this->resource['environment'],
            'debug'           => $this->resource['debug'],
            'php_version'     => $this->resource['php_version'],
            'laravel_version' => $this->resource['laravel_version'],
        ];
    }
}


