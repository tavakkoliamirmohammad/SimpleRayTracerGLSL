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

struct HitRecord {
    vec3 p;
    vec3 normal;
    double t;
    bool frontFace;
};

void set_face_normal(HitRecord rec, Ray r, vec3 outward_normal) {
    rec.frontFace = dot(r.direction, outward_normal) < 0;
    rec.normal = front_face ? outward_normal :-outward_normal;
}


Ray get_ray(float u, float v){
    return Ray(origin, lower_left_corner + u*horizontal + v*vertical - origin);
}

vec3 ray_at(Ray r, float t){
    return r.origin + t * r.direction;
}


bool hit_sphere(Sphere sphere, Ray r, float t_min, float t_max, hitRecord rec) {
    vec3 oc = r.origin - sphere.center;
    float a = dot(r.direction, r.direction);
    float half_b = dot(oc, r.direction);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;

    float discriminant = half_b * half_b - a * c;
    if (discriminant < 0) {
        return false;
    }
    float sqrtd = sqrt(discriminant);
    float root = (-half_b - sqrtd) / a;
    if (root < t_min || t_max < root) {
        root = (-half_b + sqrtd) / a;
        if (root < t_min || t_max < root)
        return false;
    }
    rec.t = root;
    rec.p = ray_at(r, rec.t);
    vec3 outward_normal = (rec.p - sphere.center) / sphere.radius;
    rec.set_face_normal(rec, r, outward_normal);

    return true;
}

vec3 ray_color(Ray r) {
    float t = hit_sphere(Sphere(vec3(0, 0, -1), 0.5), r);
    if (t > 0.0) {
        vec3 N = normalize(ray_at(r, t) - vec3(0, 0, -1));
        return 0.5 * vec3(N.x + 1, N.y + 1, N.z + 1);
    }
    vec3 unit_direction = normalize(r.direction);
    t = 0.5 * (unit_direction.y + 1.0);
    return (1.0-t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
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