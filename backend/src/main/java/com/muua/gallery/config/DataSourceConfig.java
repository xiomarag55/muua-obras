package com.muua.gallery.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfig {

    /**
     * Crea el DataSource asegurando que prepareThreshold=0 esté en la URL.
     * Esto evita el error "prepared statement S_N already exists" cuando
     * Render usa PgBouncer en modo transaction pooling.
     *
     * @ConfigurationProperties aplica las propiedades spring.datasource.hikari.*
     * (maximumPoolSize, minimumIdle, connectionTimeout) sobre el bean creado.
     */
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource(DataSourceProperties props) {
        String url = props.getUrl();
        if (!url.contains("prepareThreshold")) {
            url += (url.contains("?") ? "&" : "?") + "prepareThreshold=0&reWriteBatchedInserts=true";
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(url);
        ds.setUsername(props.getUsername());
        ds.setPassword(props.getPassword());
        ds.setDriverClassName(props.getDriverClassName() != null
                ? props.getDriverClassName()
                : "org.postgresql.Driver");
        return ds;
    }
}
