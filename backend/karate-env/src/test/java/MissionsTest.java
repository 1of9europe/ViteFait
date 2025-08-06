import com.intuit.karate.junit5.Karate;

class MissionsTest {
    
    @Karate.Test
    Karate testMissions() {
        return Karate.run("classpath:features/missions.feature")
                .relativeTo(getClass())
                .outputCucumberJson(true);
    }
} 