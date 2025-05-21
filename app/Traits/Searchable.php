<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Scope a query to search for a term in the searchable fields.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string|null  $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch(Builder $query, ?string $search = null): Builder
    {
        if (empty($search)) {
            return $query;
        }

        $searchableFields = $this->searchableFields ?? [];

        return $query->where(function (Builder $query) use ($search, $searchableFields) {
            foreach ($searchableFields as $field) {
                $query->orWhere($field, 'LIKE', "%{$search}%");
            }
        });
    }
}
