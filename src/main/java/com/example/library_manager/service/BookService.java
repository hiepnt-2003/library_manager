package com.example.library_manager.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.library_manager.model.Book;
import com.example.library_manager.repository.BookRepository;


@Service
public class BookService {
    @Autowired
    private BookRepository bookRepository;
    
    public Optional<Book> getBookById(Integer bookId) {
        return bookRepository.findById(bookId);
    }
}
