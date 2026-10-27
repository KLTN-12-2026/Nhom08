<?php

namespace App\Repositories;

abstract class BaseRepository implements RepositoryInteface
{
    protected $model;

    public function __construct($model)
    {
        $this->model = $model;
    }

    public function all(array $params = [])
    {
        // Check if model uses Laravel Scout Searchable trait
        $usesScout = in_array(\Laravel\Scout\Searchable::class, class_uses_recursive($this->model));

        if ($usesScout && !empty($params['query'])) {
            $builder = $this->model::search($params['query']);
        } else {
            $builder = $this->model::query();
            // Basic fallback search if query exists but Scout is not used
            // Note: Child repositories should override this for specific search logic
        }

        if (!empty($params['filters']) && is_array($params['filters'])) {
            foreach ($params['filters'] as $field => $value) {
                if ($value !== null && $value !== '') {
                    $builder->where($field, $value);
                }
            }
        }

        if (!empty($params['sort_by'])) {
            $dataExclude = ['created_at', 'updated_at', 'id'];
            $sortBy = $params['sort_by'];
            if (!in_array($sortBy, $dataExclude) && $usesScout && !empty($params['query'])) {
                // Scout sort logic might differ, but usually supports basic fields
                // For Meilisearch/Algolia, fields must be sortable in index settings
                $sortBy = $sortBy; 
            }
            $builder->orderBy($sortBy, $params['sort_order'] ?? 'desc');
        }

        if (!empty($params['page']) && !empty($params['per_page'])) {
            return $builder->paginate($params['per_page'], ['*'], 'page', $params['page']);
        }
        
        // Default pagination
        $perPage = $params['per_page'] ?? 10;
        return $builder->paginate($perPage);
    }

    public function find($id, $columns = ['*'])
    {
        return $this->model::find($id, $columns);
    }

    public function create(array $data)
    {
        return $this->model::create($data);
    }
    public function update(array $data, $id)
    {
        $model = $this->find($id);
        if ($model) {
            $model->update($data);
            return $model;
        }
        return null;
    }
    public function delete($id)
    {
        $model = $this->find($id);
        if ($model) {
            return $model->delete();
        }
        return false;
    }
    public function findBy($field, $value, $columns = ['*'])
    {
        return $this->model::where($field, $value)->first($columns);
    }

    public function createOrUpdate(array $data, $id = null)
    {
        if ($id) {
            $model = $this->find($id);
            if ($model) {
                $model->update($data);
                return $model;
            }
        }
        return $this->create($data);
    }

    public function firstOrCreate(array $data)
    {
        return $this->model::firstOrCreate($data);
    }

    /**
     * Find model including soft deleted records
     */
    public function findWithTrashed($id, $columns = ['*'])
    {
        return $this->model::withTrashed()->find($id, $columns);
    }

    /**
     * Restore a soft deleted model
     */
    public function restore($id)
    {
        $model = $this->findWithTrashed($id);
        if ($model && method_exists($model, 'trashed') && $model->trashed()) {
            return $model->restore();
        }
        return false;
    }

    /**
     * Permanently delete a model (force delete)
     */
    public function forceDelete($id)
    {
        $model = $this->findWithTrashed($id);
        if ($model) {
            return $model->forceDelete();
        }
        return false;
    }

    /**
     * Get all models including soft deleted
     */
    public function allWithTrashed(array $params = [])
    {
        // Note: This is a basic implementation
        // Child repositories should override if they use Scout or custom queries
        return $this->model::withTrashed()->get();
    }

    /**
     * Get only soft deleted models
     */
    public function onlyTrashed(array $params = [])
    {
        // Note: This is a basic implementation
        // Child repositories should override if they use Scout or custom queries
        return $this->model::onlyTrashed()->get();
    }
}
