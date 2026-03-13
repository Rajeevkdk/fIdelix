package com.fidelix.backend.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(RuntimeException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Map<String, String> handleRuntime(RuntimeException ex) {
    String msg = ex.getMessage() == null ? "Request failed" : ex.getMessage();

    if (msg.toLowerCase().contains("not found")) {
      return Map.of("error", msg);
    }

    return Map.of("error", msg);
  }
}