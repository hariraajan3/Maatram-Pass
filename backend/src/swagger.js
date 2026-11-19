import swaggerAutogen from 'swagger-autogen';

const swagger = swaggerAutogen();

const doc = {
    info: { title: 'Maatram Volunteer Pass API',
            description: 'API documentation for the Maatram Volunteer Pass backend.' },
            host: 'localhost:4000'
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Point to your main file where routes are defined

swagger(outputFile, endpointsFiles, doc);
