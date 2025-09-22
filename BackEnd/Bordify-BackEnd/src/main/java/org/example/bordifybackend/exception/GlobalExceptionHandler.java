package org.example.bordifybackend.exception;

import io.jsonwebtoken.ExpiredJwtException;
import org.example.bordifybackend.Dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Exception Handler for username not found Exception
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse HandleResourcesNotFoundException(ResourceNotFoundException ex){
        return new ApiResponse(
                404,
                "Unable to Found Resources",
                null
        );
    }

    // Exception Handler for Bad Credentials Exception
    @ExceptionHandler(BadCredentialException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleBadCredentials(BadCredentialsException ex){
        return new ApiResponse(
                400,
                "Bad Credentials",
                null
        );
    }

    // Exception Handler for JWT Token Expired Exception
    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleJWTTokenExpiredException(ExpiredJwtException ex){
        return new ApiResponse(
                401,
                "JWT Token Expired",
                null
        );
    }

    // Exception Handler for all other exceptions
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse handleAllExceptions(RuntimeException ex){
        return new ApiResponse(
                500,
                "Internal Server Error",
                ex.getMessage()
        );
    }
}
