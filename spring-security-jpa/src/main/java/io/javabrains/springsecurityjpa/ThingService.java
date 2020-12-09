package io.javabrains.springsecurityjpa;

import io.javabrains.springsecurityjpa.models.Thing;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ThingService  {

    @Autowired
    ThingRepository thingRepository;

    public Thing createThing(String thingName)  {
    	Thing t = new Thing(thingName);
    	thingRepository.save( t );

        return t;
    }
}
