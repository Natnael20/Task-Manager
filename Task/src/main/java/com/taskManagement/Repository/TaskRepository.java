package com.taskManagement.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.taskManagement.Model.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    Optional<Task> findById(long id);

    @Query("SELECT t FROM Task t ORDER BY " +
           "CASE t.priority " +
           "WHEN 'HIGH' THEN 1 " +
           "WHEN 'MEDIUM' THEN 2 " +
           "WHEN 'LOW' THEN 3 " +
           "ELSE 4 END ASC")
    List<Task> findAllSortedByPriority();

}
