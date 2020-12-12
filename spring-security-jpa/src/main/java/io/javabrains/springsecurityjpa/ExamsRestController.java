package io.javabrains.springsecurityjpa;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
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
import io.javabrains.springsecurityjpa.models.Exam;
import io.javabrains.springsecurityjpa.models.ExamListItem;
import io.javabrains.springsecurityjpa.models.Exam;
import io.javabrains.springsecurityjpa.models.UserLoginCredentials;

@RestController
public class ExamsRestController{
	
	@Autowired
	ExamRepository examsRepository;
	
	static final Logger log = 
	        LoggerFactory.getLogger(ExamsRestController.class);	
	
	@CrossOrigin(origins = "http://localhost:4200")
	@GetMapping("/ExamsService")
    public Collection<ExamListItem> Exams(@RequestParam(name="token", required=true, defaultValue="") String token) {
		Collection<ExamListItem> testApplications= new ArrayList<ExamListItem>();
		log.info("ExamsService called with token:{}", token);
	
		try {
			UUID uuid = UUID.fromString(token);
			UserLoginCredentials user = TokenPool.getUser(uuid);
			if(user != null) {
				String username = user.getUsername();
				log.info("exams found :{}", examsRepository.findByTeacher_Username(username).size());
				for(Exam e : examsRepository.findByTeacher_Username(username)) {
					ExamListItem n = new ExamListItem();
					n.setId(e.getId());
					n.setLabel(e.getLabel());
					n.setStudentName(e.getStudent().getUsername());
					n.setTeacherName(e.getTeacher().getUsername());
					n.setGrade(e.getGrade());
					n.setCompleted(e.isCompleted());
					n.setApplicationDate(new SimpleDateFormat("yyyy-MM-dd hh:mm").format(e.getApplicationDate()));
					testApplications.add(n);
				}
			}
			else {
				log.error("***********************************************");
				log.error("testApplicationsService no user found for token");
			}
		}
		catch( IllegalArgumentException  e) {
			log.error("token ilegal:'{}'", token);
		}
    	return testApplications;
    }

}

