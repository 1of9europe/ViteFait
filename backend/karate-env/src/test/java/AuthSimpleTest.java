import com.intuit.karate.junit5.Karate;

class AuthSimpleTest {
    
    @Karate.Test
    Karate testAuthSimple() {
        return Karate.run("classpath:features/auth-simple.feature")
                .relativeTo(getClass());
    }
} 