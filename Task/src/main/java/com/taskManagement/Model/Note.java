package com.taskManagement.Model;

import java.time.LocalTime;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;
import lombok.RequiredArgsConstructor;


@Entity
@Table(name = "notes")
@Data
@RequiredArgsConstructor
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private Date date;

    @Column(name = "time", nullable = false)
    private LocalTime time;

    @Column(name = "title", nullable= false, length=30)
    @NotEmpty
    @NotBlank
    @Size(min=0, max=30, message="title cannot be empty or null")
    private String title;

    @Column(name = "description", nullable = false)
    private String description;


}
