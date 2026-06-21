package com.taskManagement.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskManagement.Model.CheckList;

import java.util.List;

@Repository
public interface CheckListRepository extends JpaRepository<CheckList, Long> {

    List<CheckList> findByTaskId(Long taskId);

    List<CheckList> findByTaskIdAndCompleted(Long taskId, boolean completed);
    
    long countByTaskId(Long taskId);     
     
}
