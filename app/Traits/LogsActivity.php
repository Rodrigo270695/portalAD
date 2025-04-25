<?php

namespace App\Traits;

use App\Services\ActivityLogService;

trait LogsActivity
{
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            app(ActivityLogService::class)->log(
                'model_created',
                'Se creó un nuevo registro en ' . class_basename($model),
                [
                    'model' => class_basename($model),
                    'id' => $model->id,
                    'attributes' => $model->getAttributes()
                ]
            );
        });

        static::updated(function ($model) {
            $changes = $model->getDirty();
            unset($changes['updated_at']);

            if (!empty($changes)) {
                app(ActivityLogService::class)->log(
                    'model_updated',
                    'Se actualizó un registro en ' . class_basename($model),
                    [
                        'model' => class_basename($model),
                        'id' => $model->id,
                        'changes' => $changes,
                        'original' => array_intersect_key($model->getOriginal(), $changes)
                    ]
                );
            }
        });

        static::deleted(function ($model) {
            app(ActivityLogService::class)->log(
                'model_deleted',
                'Se eliminó un registro de ' . class_basename($model),
                [
                    'model' => class_basename($model),
                    'id' => $model->id,
                    'attributes' => $model->getAttributes()
                ]
            );
        });
    }
}
