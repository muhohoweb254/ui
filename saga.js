// ============================================
// SAGA PATTERN: SCHOOL ENROLLMENT SYSTEM
// ============================================
// This example demonstrates orchestration-based saga pattern
// for student enrollment across multiple microservices

// ============================================
// 1. STUDENT SERVICE
// ============================================
class StudentService {
    constructor() {
        this.students = new Map();
        this.reservations = new Map();
    }

    // Reserve student slot (compensatable)
    reserveStudent(enrollmentId, studentData) {
        console.log(`[StudentService] Reserving student for enrollment ${enrollmentId}`);

        if (this.students.has(studentData.studentId)) {
            throw new Error('Student already exists');
        }

        this.reservations.set(enrollmentId, studentData);
        return { success: true, studentId: studentData.studentId };
    }

    // Confirm student creation
    confirmStudent(enrollmentId) {
        console.log(`[StudentService] Confirming student for enrollment ${enrollmentId}`);
        const studentData = this.reservations.get(enrollmentId);
        this.students.set(studentData.studentId, studentData);
        this.reservations.delete(enrollmentId);
        return { success: true };
    }

    // Compensating transaction: Cancel reservation
    cancelStudentReservation(enrollmentId) {
        console.log(`[StudentService] COMPENSATING: Canceling student reservation ${enrollmentId}`);
        this.reservations.delete(enrollmentId);
        return { success: true };
    }
}

// ============================================
// 2. COURSE SERVICE
// ============================================
class CourseService {
    constructor() {
        this.enrollments = new Map();
        this.courses = new Map([
            ['CS101', { id: 'CS101', name: 'Intro to Programming', capacity: 30, enrolled: 0 }],
            ['MATH201', { id: 'MATH201', name: 'Calculus I', capacity: 25, enrolled: 0 }],
        ]);
    }

    // Reserve course seat
    reserveCourse(enrollmentId, studentId, courseId) {
        console.log(`[CourseService] Reserving course ${courseId} for enrollment ${enrollmentId}`);

        const course = this.courses.get(courseId);
        if (!course) {
            throw new Error('Course not found');
        }
        if (course.enrolled >= course.capacity) {
            throw new Error('Course is full');
        }

        this.enrollments.set(enrollmentId, { studentId, courseId });
        course.enrolled++;
        return { success: true, courseId };
    }

    // Confirm enrollment
    confirmEnrollment(enrollmentId) {
        console.log(`[CourseService] Confirming enrollment ${enrollmentId}`);
        return { success: true };
    }

    // Compensating transaction: Cancel course reservation
    cancelCourseReservation(enrollmentId) {
        console.log(`[CourseService] COMPENSATING: Canceling course reservation ${enrollmentId}`);
        const enrollment = this.enrollments.get(enrollmentId);
        if (enrollment) {
            const course = this.courses.get(enrollment.courseId);
            course.enrolled--;
            this.enrollments.delete(enrollmentId);
        }
        return { success: true };
    }
}

// ============================================
// 3. PAYMENT SERVICE
// ============================================
class PaymentService {
    constructor() {
        this.payments = new Map();
    }

    // Process payment
    processPayment(enrollmentId, studentId, amount) {
        console.log(`[PaymentService] Processing payment of $${amount} for enrollment ${enrollmentId}`);

        // Simulate payment processing
        if (amount <= 0) {
            throw new Error('Invalid payment amount');
        }

        this.payments.set(enrollmentId, {
            studentId,
            amount,
            status: 'processed',
            timestamp: new Date()
        });
        return { success: true, transactionId: `TXN-${enrollmentId}` };
    }

    // Compensating transaction: Refund payment
    refundPayment(enrollmentId) {
        console.log(`[PaymentService] COMPENSATING: Refunding payment for enrollment ${enrollmentId}`);
        const payment = this.payments.get(enrollmentId);
        if (payment) {
            payment.status = 'refunded';
        }
        return { success: true };
    }
}

// ============================================
// 4. NOTIFICATION SERVICE
// ============================================
class NotificationService {
    sendEnrollmentConfirmation(studentId, courseId) {
        console.log(`[NotificationService] Sending confirmation email to student ${studentId} for course ${courseId}`);
        return { success: true };
    }

    sendEnrollmentFailure(studentId, reason) {
        console.log(`[NotificationService] Sending failure notification to student ${studentId}: ${reason}`);
        return { success: true };
    }
}

// ============================================
// 5. SAGA ORCHESTRATOR
// ============================================
class EnrollmentSagaOrchestrator {
    constructor(studentService, courseService, paymentService, notificationService) {
        this.studentService = studentService;
        this.courseService = courseService;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
        this.sagas = new Map();
    }

    async enrollStudent(enrollmentData) {
        const { enrollmentId, studentData, courseId, amount } = enrollmentData;

        console.log(`\n========================================`);
        console.log(`Starting Saga for Enrollment: ${enrollmentId}`);
        console.log(`========================================\n`);

        const saga = {
            enrollmentId,
            steps: [],
            status: 'in_progress'
        };
        this.sagas.set(enrollmentId, saga);

        try {
            // STEP 1: Reserve Student
            console.log('STEP 1: Reserve Student');
            const studentResult = this.studentService.reserveStudent(enrollmentId, studentData);
            saga.steps.push({
                name: 'reserveStudent',
                status: 'completed',
                compensate: () => this.studentService.cancelStudentReservation(enrollmentId)
            });

            // STEP 2: Reserve Course
            console.log('\nSTEP 2: Reserve Course');
            const courseResult = this.courseService.reserveCourse(
                enrollmentId,
                studentData.studentId,
                courseId
            );
            saga.steps.push({
                name: 'reserveCourse',
                status: 'completed',
                compensate: () => this.courseService.cancelCourseReservation(enrollmentId)
            });

            // STEP 3: Process Payment
            console.log('\nSTEP 3: Process Payment');
            const paymentResult = this.paymentService.processPayment(
                enrollmentId,
                studentData.studentId,
                amount
            );
            saga.steps.push({
                name: 'processPayment',
                status: 'completed',
                compensate: () => this.paymentService.refundPayment(enrollmentId)
            });

            // STEP 4: Confirm all services
            console.log('\nSTEP 4: Confirm All Services');
            this.studentService.confirmStudent(enrollmentId);
            this.courseService.confirmEnrollment(enrollmentId);

            // STEP 5: Send notification
            console.log('\nSTEP 5: Send Notification');
            this.notificationService.sendEnrollmentConfirmation(
                studentData.studentId,
                courseId
            );

            saga.status = 'completed';
            console.log(`\n✅ Saga completed successfully for enrollment ${enrollmentId}\n`);

            return { success: true, enrollmentId };

        } catch (error) {
            console.error(`\n❌ Saga failed: ${error.message}`);
            console.log(`\n========================================`);
            console.log('Starting Compensation (Rollback)');
            console.log(`========================================\n`);

            // Execute compensating transactions in reverse order
            await this.compensate(saga);

            // Notify student of failure
            this.notificationService.sendEnrollmentFailure(
                studentData.studentId,
                error.message
            );

            saga.status = 'compensated';
            console.log(`\n✅ Compensation completed for enrollment ${enrollmentId}\n`);

            return { success: false, error: error.message, enrollmentId };
        }
    }

    async compensate(saga) {
        // Execute compensating transactions in reverse order
        const completedSteps = saga.steps.filter(step => step.status === 'completed');

        for (let i = completedSteps.length - 1; i >= 0; i--) {
            const step = completedSteps[i];
            console.log(`Compensating step: ${step.name}`);
            try {
                await step.compensate();
                step.status = 'compensated';
            } catch (error) {
                console.error(`Failed to compensate ${step.name}: ${error.message}`);
            }
        }
    }

    getSagaStatus(enrollmentId) {
        return this.sagas.get(enrollmentId);
    }
}

// ============================================
// 6. DEMO USAGE
// ============================================
async function runDemo() {
    // Initialize services
    const studentService = new StudentService();
    const courseService = new CourseService();
    const paymentService = new PaymentService();
    const notificationService = new NotificationService();

    // Initialize saga orchestrator
    const sagaOrchestrator = new EnrollmentSagaOrchestrator(
        studentService,
        courseService,
        paymentService,
        notificationService
    );

    // SCENARIO 1: Successful enrollment
    console.log('\n\n🎓 SCENARIO 1: Successful Enrollment');
    console.log('=====================================\n');

    const enrollment1 = await sagaOrchestrator.enrollStudent({
        enrollmentId: 'ENR-001',
        studentData: {
            studentId: 'STU-001',
            name: 'John Doe',
            email: 'john@example.com'
        },
        courseId: 'CS101',
        amount: 500
    });

    // SCENARIO 2: Failed enrollment (course full) - triggers compensation
    console.log('\n\n🎓 SCENARIO 2: Failed Enrollment (Compensation Demo)');
    console.log('====================================================\n');

    // Fill up the course first
    const course = courseService.courses.get('MATH201');
    course.enrolled = course.capacity; // Make it full

    const enrollment2 = await sagaOrchestrator.enrollStudent({
        enrollmentId: 'ENR-002',
        studentData: {
            studentId: 'STU-002',
            name: 'Jane Smith',
            email: 'jane@example.com'
        },
        courseId: 'MATH201', // This course is now full
        amount: 450
    });

    // Display final results
    console.log('\n\n📊 FINAL RESULTS');
    console.log('=================');
    console.log('Enrollment 1:', enrollment1);
    console.log('Enrollment 2:', enrollment2);
    console.log('\nStudents:', Array.from(studentService.students.keys()));
    console.log('Course Enrollments:', Array.from(courseService.enrollments.keys()));
}

// Run the demo
runDemo().catch(console.error);
