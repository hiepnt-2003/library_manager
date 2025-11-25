package com.example.library_manager.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.library_manager.model.User;
import com.example.library_manager.model.enums.UserType;
import com.example.library_manager.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public User addUser(User user) {
        user.setIsActive(1);
        user.setUserType(UserType.READER);
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public void disableUser(Integer id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setIsActive(0);
            userRepository.save(user);
        });
    }
}
