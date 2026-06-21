package com.taskManagement.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskManagement.DTO.MessageDto;
import com.taskManagement.DTO.TaskDto;
import com.taskManagement.ServiceImpl.TaskServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskServiceImpl taskServiceImpl;

    @GetMapping("/all")
    public List<TaskDto> getAllTasks() {
        return taskServiceImpl.getAllTasks();
    }

    @GetMapping("/{id}")
    public TaskDto getTask(@PathVariable long id) {
        return taskServiceImpl.getTask(id);
    }

    @PostMapping("/create")
    public TaskDto createTask(@Valid @RequestBody TaskDto taskDto) {
        return taskServiceImpl.createTask(taskDto);
    }

    @PutMapping("/update/{id}") 
    public MessageDto updateTask(@PathVariable Long id,@Valid @RequestBody TaskDto taskDto) {
        return taskServiceImpl.updateTask(id, taskDto);
    }

    @DeleteMapping("/{id}")
    public MessageDto deletetask(@PathVariable Long id) {
        return taskServiceImpl.deleteTask(id);
    }
}
