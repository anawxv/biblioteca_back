package com.biblioteca.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final String[] DEFAULT_PATTERNS = {
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.ngrok-free.app",
            "https://*.ngrok-free.dev",
            "https://*.ngrok.io",
            "https://*.ngrok.app",
            "https://*.ngrok.dev"
    };

    @Value("${app.cors.allowed-origin-patterns:}")
    private String allowedOriginPatterns;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] patterns = StringUtils.hasText(allowedOriginPatterns)
                ? StringUtils.commaDelimitedListToStringArray(allowedOriginPatterns)
                : DEFAULT_PATTERNS;

        registry.addMapping("/api/**")
                .allowedOriginPatterns(patterns)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
