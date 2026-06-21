package com.taskManagement.Repository;

import com.taskManagement.Model.Note;
import com.taskManagement.DTO.NoteDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    Optional<NoteDto> getNoteById(long id);

}
