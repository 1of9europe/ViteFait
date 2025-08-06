import com.intuit.karate.junit5.Karate;

class PaymentsTest {
    
    @Karate.Test
    Karate testPayments() {
        return Karate.run("classpath:features/payments.feature")
                .relativeTo(getClass())
                .outputCucumberJson(true);
    }
} 