package io.javabrains.springsecurityjpa;

import io.javabrains.springsecurityjpa.models.Thing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ThingRepository extends JpaRepository<Thing, Integer> {
    Optional<Thing> findByThingName(String thingName);
}
