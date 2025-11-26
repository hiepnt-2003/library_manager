package com.example.library_manager.repository;

import com.example.library_manager.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {
    
    // Tìm sách theo tiêu đề
    List<Book> findByTitleContaining(String title);
    
    // Tìm sách theo tác giả
    List<Book> findByAuthorId(Integer authorId);
    
    // Tìm sách theo category
    List<Book> findByCategoryId(Integer categoryId);
    
    // Tìm sách còn khả dụng (bookAvailable > 0)
    @Query("SELECT b FROM Book b WHERE b.bookAvailable > 0")
    List<Book> findAvailableBooks();
    
    // Kiểm tra sách còn khả dụng không
    @Query("SELECT CASE WHEN b.bookAvailable > 0 THEN true ELSE false END FROM Book b WHERE b.id = :bookId")
    boolean isBookAvailable(Integer bookId);
}