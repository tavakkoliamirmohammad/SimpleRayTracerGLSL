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
    float t;
    bool frontFace;
};


Sphere world[] = Sphere[](
Sphere(vec3(0, 0, -1), 0.5),
Sphere(vec3(0, -100.5, -1), 100)
);

highp float rand(vec2 co){
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy, vec2(a, b));
    highp float sn= mod(dt, 3.14);
    return 2 * fract(sin(sn) * c) - 1;
}

void setFaceNormal(out HitRecord rec, Ray r, vec3 outward_normal) {
    rec.frontFace = dot(r.direction, outward_normal) < 0;
    rec.normal = rec.frontFace ? outward_normal :-outward_normal;
}


Ray get_ray(float u, float v){
    return Ray(origin, lower_left_corner + u*horizontal + v*vertical - origin);
}

vec3 ray_at(Ray r, float t){
    return r.origin + t * r.direction;
}


bool hit_sphere(Sphere sphere, Ray r, float t_min, float t_max, out HitRecord rec) {
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
    setFaceNormal(rec, r, outward_normal);

    return true;
}

bool world_hit(Ray r, float t_min, float t_max, out HitRecord rec){
    HitRecord temp;
    bool hit_anything = false;
    float closest_so_far = t_max;

    for (int i = 0; i < world.length(); i++) {
        if (hit_sphere(world[i], r, t_min, closest_so_far, temp)){
            hit_anything = true;
            closest_so_far = temp.t;
            rec = temp;
        }
    }

    return hit_anything;
}

vec3 ray_color(Ray r) {
    HitRecord rec;
    if (world_hit(r, 0, 1.0 / 0, rec)) {
        return 0.5 * (rec.normal + vec3(1, 1, 1));
    }
    vec3 unit_direction = normalize(r.direction);
    float t = 0.5 * (unit_direction.y + 1.0);
    return (1.0-t) * vec3(1.0, 1.0, 1.0) + t * vec3(0.5, 0.7, 1.0);
}

void main() {
    const int samplesPerPixel = 100;
    float u, v;
    Ray r;
    color = vec3(0, 0, 0);
    for (int s = 0; s < samplesPerPixel; ++s) {
        u = (gl_FragCoord.x + rand(color.xy)) / window_size.x;
        v = (gl_FragCoord.y + rand(color.xz))/ window_size.y;
        r = get_ray(u, v);
        color += ray_color(r);
    }
    color /= samplesPerPixel;
}