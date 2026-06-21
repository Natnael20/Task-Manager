package com.taskManagement.ServiceImpl;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskManagement.DTO.TaskProgressDto;
import com.taskManagement.Mapping.TaskMapper;
import com.taskManagement.Model.CheckList;
import com.taskManagement.Model.Task;
import com.taskManagement.Repository.CheckListRepository;
import com.taskManagement.Repository.TaskRepository;
import com.taskManagement.Service.CheckListService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ChecklistServiceImpl implements CheckListService {

    private final CheckListRepository checkListRepository;
    
    private final TaskRepository taskRepository;
    
    private final TaskMapper taskMapper;
    
    @Override
    public TaskProgressDto toggleChecklistItem(Long taskId, Long checklistId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        CheckList checkList = checkListRepository.findById(checklistId)
            .orElseThrow();
        
        // Toggle the completed status
        boolean newStatus = !checkList.isCompleted();
        checkList.setCompleted(newStatus);
        
        // Save the updated checklist item
        checkListRepository.save(checkList);
        
        // Update task status based on checklist completion
        taskMapper.updateStatus(task);
        
        // Save the updated task
        Task updatedTask = taskRepository.save(task);
        return taskMapper.toProgressDto(updatedTask);
    }
    
    @Override
    public TaskProgressDto getTaskProgress(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        
        taskMapper.updateStatus(task);
        taskRepository.save(task);
        
        return taskMapper.toProgressDto(task);
    }
}