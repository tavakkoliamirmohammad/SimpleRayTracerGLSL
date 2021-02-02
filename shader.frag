#version 460 core

out vec3 color;

vec2 window_size = vec2(1280, 720);

struct Ray {
    vec3 origin;
    vec3 direction;
};


void main() {
//    vec3 col = vec3(0, 0, 0);
    float u, v;
//    Ray r;
    u = gl_FragCoord.x / window_size.x;
    v = gl_FragCoord.y / window_size.y;
//    r = get_ray(u, v);
//    col += color(r);
    color = vec3(u, v, 1);
}