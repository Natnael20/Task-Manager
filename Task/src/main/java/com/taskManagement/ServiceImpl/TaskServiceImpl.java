package com.taskManagement.ServiceImpl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.taskManagement.DTO.MessageDto;
import com.taskManagement.DTO.TaskDto;
import com.taskManagement.Enum.PriorityType;
import com.taskManagement.Enum.StatusType;
import com.taskManagement.Mapping.TaskMapper;
import com.taskManagement.Repository.TaskRepository;
import com.taskManagement.Service.TaskService;
import com.taskManagement.Model.Task;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskMapper taskMapper;

    public List<TaskDto> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        
        // Update status for each task based on checklist completion
        tasks.forEach(this::updateTaskStatus);
        
        // Save all updated tasks
        List<Task> updatedTasks = taskRepository.saveAll(tasks);
        
        // Convert to DTOs
        return updatedTasks.stream()
            .map(taskMapper::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public TaskDto getTask(long id) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            return taskMapper.toDto(taskOpt.get());
            
        }
        return null;
    }

    @Override
    public TaskDto createTask(TaskDto taskDto) {
        Task task = taskMapper.toEntity(taskDto);
        handleEnums(task, taskDto);
        Task savedTask = taskRepository.save(task);
        return taskMapper.toDto(savedTask);
    }

    @Override
    public MessageDto updateTask(long id, TaskDto taskDto) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        taskMapper.updateEntity(task, taskDto);
        taskRepository.save(task);
        return new MessageDto(true, "Task updated successfully");
    }


    @Override
    public MessageDto deleteTask(long id) {
        Task Task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        taskRepository.delete(Task);
        return new MessageDto(true, "Task deleted successfully");
    }

    private void handleEnums(Task task, TaskDto taskDto) {
        if(taskDto.getStatus() == null) {
            task.setStatus(StatusType.PENDING);
        }
        if(taskDto.getPriority() == null) {
            task.setPriority(PriorityType.MEDIUM);
        }
    }

    private void updateTaskStatus(Task task) {
        taskMapper.updateStatus(task);
    }
}
