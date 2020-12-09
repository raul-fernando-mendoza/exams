package io.javabrains.springsecurityjpa;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.javabrains.springsecurityjpa.models.Thing;

@RestController
public class ThingRestController {
	
	@Autowired
	ThingService ts;

    @GetMapping("/admin/addThings")
    public String addThings(@RequestParam(value = "name", defaultValue = "World") String name) {
    	 
    	 
    	Thing t = ts.createThing(name);
    	String s = "<h1>hello from add things</h1>";
    	s += "thins added" + t;
        return (s);
        
    }    
    
}

