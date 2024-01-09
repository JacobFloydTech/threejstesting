// Define the vertex shader
export const mountainVertex = `
    varying vec2 vUv;
    // Perlin noise function
    float perlin(float x) {
        return sin(x * 57.5453);  // Simple example, you may want to use a more advanced Perlin noise implementation
    }
    
    float perlin(vec2 P) {
        vec2 i = floor(P);
        vec2 f = fract(P);
    
        // Smoothstep function
        vec2 u = f*f*(3.0-2.0*f);
    
        // Hash function
        return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                       dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                   mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                       dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    }
    
    // Hash function for permutation
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
        vUv = uv;

        // Extract vertex position
        vec3 position = position;

        // Modify vertex position based on noise
        float x = position.x / 70.;
        float y = position.y / 70.;
        float z = position.z / 70.;
        vec2 pos = vec2(x,z);
        float noiseValue = perlin(pos);
        float distanceToCenter = abs(x);
        float amp = 1.0 - pow(distanceToCenter, 3.5);

        position.y -= noiseValue * amp;

        // Set the transformed position
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const mountainShader = `
varying vec2 vUv;

uniform float snowHeight;
uniform float darkHeight;


void main() {
    // Calculate the normalized height
    float height = vUv.y;


    // Define transition thresholds
    float snowThreshold = smoothstep(snowHeight - 0.01, snowHeight + 0.01, height);
    float darkThreshold = smoothstep(darkHeight - 0.01, darkHeight + 0.01, height);

    // Define colors
    vec3 snowColor = vec3(1.0, 1.0, 1.0);  // Snow color (white)
    vec3 darkColor = vec3(0.1, 0.1, 0.1);  // Dark color
    vec3 greenColor = vec3(0.0, 0.7, 0.0); // Green color

    // Interpolate between colors based on height
    vec3 finalColor = mix(snowColor, darkColor, snowThreshold);
    finalColor = mix(finalColor, greenColor, darkThreshold);

    gl_FragColor = vec4(finalColor, 1.0);
}
`


export const instancedVertexShader = `


    varying vec2 vUv;
    
    void main() {

        // Apply projection and view transformations
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

       
    }
`;
