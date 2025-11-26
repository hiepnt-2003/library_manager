package com.example.library_manager.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.library_manager.model.Reader;
import com.example.library_manager.service.ReaderService;

@RestController
@RequestMapping("/readers")
public class ReaderController {
    @Autowired
    private ReaderService readerService;

    // Lấy danh sách tất cả độc giả
    @GetMapping
    public List<Reader> getAllReaders() {
        return readerService.getAllReaders();
    }

    // Lấy độc giả theo ID
    @GetMapping("/{id}")
    public Optional<Reader> getReaderById(@PathVariable Integer id) {
        return readerService.getReaderById(id);
    }

    // Thêm độc giả mới
    @PostMapping
    public ResponseEntity<?> addReader(@RequestBody Reader reader) {
        // Check username
        if (readerService.isUsernameExists(reader.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username đã tồn tại"));
        }
        
        Reader savedReader = readerService.addReader(reader);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReader);
    }

    // Cập nhật thông tin độc giả
    @PutMapping("/{id}")
    public Reader updateReader(@PathVariable Integer id, @RequestBody Reader reader) {
        reader.setId(id);
        return readerService.updateReader(reader);
    }
}