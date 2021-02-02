#version 460 core

out vec3 color;

vec2 window_size = vec2(1280, 720);

float aspect_ratio = 16.0 / 9.0;
float viewport_height = 2.0;
float viewport_width = aspect_ratio * viewport_height;
float focal_length = 1.0;

vec3 origin = vec3(0, 0, 0);
vec3 horizontal = vec3(viewport_width, 0, 0);
vec3 vertical = vec3(0, viewport_height, 0);
vec3 lower_left_corner = origin - horizontal/2 - vertical/2 - vec3(0, 0, focal_length);

struct Ray {
    vec3 origin;
    vec3 direction;
};

struct Sphere {
    vec3 center;
    float radius;
};

bool hit_sphere(Sphere sphere, Ray r) {
    vec3 oc = r.origin - sphere.center;
    float a = dot(r.direction, r.direction);
    float b = 2.0 * dot(oc, r.direction);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;
    float discriminant = b * b - 4 * a * c;
    return (discriminant > 0);
}

vec3 ray_color(Ray r) {
    if (hit_sphere(Sphere(vec3(0, 0, -1), 0.5), r)){
        return vec3(1, 0, 0);
    }
    vec3 unit_direction = normalize(r.direction);
    float t = 0.5 * (unit_direction.y + 1.0);
    return (1.0-t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
}

Ray get_ray(float u, float v){
    return Ray(origin, lower_left_corner + u*horizontal + v*vertical - origin);
}

void main() {
    //    vec3 col = vec3(0, 0, 0);
    float u, v;
    Ray r;
    u = gl_FragCoord.x / window_size.x;
    v = gl_FragCoord.y / window_size.y;
    r = get_ray(u, v);
    //    col += color(r);
    color = ray_color(r);
}