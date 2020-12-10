package io.javabrains.springsecurityjpa;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.javabrains.springsecurityjpa.models.MyUserDetails;
import io.javabrains.springsecurityjpa.models.TestApplication;

@RestController
public class TestApplicationsRestController{
	
	@Autowired
	TestApplicationRepository testApplicationRepository;
	
	static final Logger log = 
	        LoggerFactory.getLogger(TestApplicationsRestController.class);	
	
	@CrossOrigin(origins = "http://localhost:4200")
	@GetMapping("/testApplicationsService")
    public TestApplication[] getTestApplications(@RequestParam(name="token", required=true, defaultValue="") String token) {
		TestApplication testApplications[] = new TestApplication[0];
		log.info("testApplicationsService called with token:{}", token);
		if( testApplicationRepository == null) {
			log.error("***************************************");
			log.error("testApplicationRepository is NULL");
			return new TestApplication[0];
		}
		
		try {
			UUID uuid = UUID.fromString(token);
			MyUserDetails user = TokenPool.getUser(uuid);
			if(user != null) {
				String username = user.getUsername();
				log.info("TestApplicationService:{} repository:{}",user.getUsername(), testApplicationRepository);
				List<TestApplication> ta = testApplicationRepository.findByTeacher_username(username);
				log.info("retrieved:{}", ta.size());
				TestApplication ta_array[] = new TestApplication[ta.size()];
				int i=0;
				for(TestApplication t : ta) {
					ta_array[i++] = t;
				}
				return ta_array;	
			}
			else {
				log.error("***********************************************");
				log.error("testApplicationsService no user found for token");
			}
		}
		catch( IllegalArgumentException  e) {
			log.error("token ilegal:'{}'", token);
			return new TestApplication[0];
		}
    	return testApplications;
    }

}

