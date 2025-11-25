package com.example.library_manager.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping
    public List<Reader> getAllReaders() {
        return readerService.getAllReaders();
    }

    @GetMapping("/{id}")
    public Optional<Reader> getReaderById(@PathVariable Integer id) {
        return readerService.getReaderById(id);
    }

    @PostMapping
    public Reader addReader(@RequestBody Reader reader) {
        return readerService.addReader(reader);
    }

    @PutMapping("/{id}")
    public Reader updateReader(@PathVariable Integer id, @RequestBody Reader reader) {
        reader.setId(id);
        return readerService.updateReader(reader);
    }
}
