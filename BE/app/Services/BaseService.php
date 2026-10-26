<?php

namespace App\Services;

abstract class BaseService implements ServiceInteface
{
    protected $repository;

    public function __construct($repository)
    {
        $this->repository = $repository;
    }

    public function all($data)
    {
        if (is_array($data)) {
            return $this->repository->all($data);
        }

        if (method_exists($data, 'filters')) {
            $filters = $data->filters();
            $sort = $data->sort();
            $pagination = $data->pagination();
            $data = array_merge($filters, $sort, $pagination);
        } elseif ($data instanceof \Illuminate\Http\Request) {
            $data = $data->all();
        }

        return $this->repository->all($data);
    }

    public function find($id, $columns = ['*'])
    {
        return $this->repository->find($id, $columns);
    }
    public function create(array $data)
    {
        return $this->repository->create($data);
    }
    public function update(array $data, $id)
    {
        return $this->repository->update($data, $id);
    }
    public function delete($id)
    {
        return $this->repository->delete($id);
    }
    public function findBy($field, $value, $columns = ['*'])
    {
        return $this->repository->findBy($field, $value, $columns);
    }

    public function createOrUpdate(array $data, $id = null)
    {
        return $this->repository->createOrUpdate($data, $id);
    }

    /**
     * Restore a soft deleted model
     */
    public function restore($id)
    {
        return $this->repository->restore($id);
    }

    /**
     * Permanently delete a model (force delete)
     */
    public function forceDelete($id)
    {
        return $this->repository->forceDelete($id);
    }

    /**
     * Return a success response
     */
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'status_code' => $statusCode,
        ];
    }

    /**
     * Return an error response
     */
    protected function errorResponse(string $message = 'Error', int $statusCode = 400, $errors = null): array
    {
        return [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'status_code' => $statusCode,
        ];
    }
}
