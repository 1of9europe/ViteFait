import com.intuit.karate.junit5.Karate;

class AuthTest {
    
    @Karate.Test
    Karate testAuth() {
        return Karate.run("classpath:features/auth.feature")
                .relativeTo(getClass())
                .outputCucumberJson(true);
    }
} 