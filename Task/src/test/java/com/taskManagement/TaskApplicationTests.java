package com.taskManagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TaskApplicationTests {

	@Test
    void contextLoads() {
        // This test just checks if the Spring Boot application starts up
        // If this fails, your app won't run at all
        System.out.println("Application context loaded successfully!");
    }

}
