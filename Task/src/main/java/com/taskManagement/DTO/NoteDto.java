package com.taskManagement.DTO;

import java.time.LocalTime;
import java.util.Date;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class NoteDto {

    private Long id;
    private Date date;
    private LocalTime time;
    private String title;
    private String description;

}
