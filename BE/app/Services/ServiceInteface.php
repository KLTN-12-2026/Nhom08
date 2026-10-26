<?php

namespace App\Services;

interface ServiceInteface
{
    public function all($data);
    public function find($id, $columns = ['*']);
    public function create(array $data);
    public function update(array $data, $id);
    public function delete($id);
    public function findBy($field, $value, $columns = ['*']);
    public function createOrUpdate(array $data, $id = null);
}
