package com.taskManagement.Service;

import java.util.List;

import com.taskManagement.DTO.MessageDto;
import com.taskManagement.DTO.TaskDto;

public interface TaskService  {

    List<TaskDto> getAllTasks();
    TaskDto getTask(long id);
    TaskDto createTask(TaskDto taskDto);
    MessageDto updateTask(long id, TaskDto taskDto);
    MessageDto deleteTask(long id);

}
