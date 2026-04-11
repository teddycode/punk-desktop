/*
 * Calculator CApp - Simple WASM Calculator
 * Compile with: 
 * clang --target=wasm32 -O3 -nostdlib -Wl,--no-entry -Wl,--export-all -o calculator.wasm calculator.c
 */

// Imported functions from JavaScript env
void clear_screen(int colorIdx);
void draw_rect(int x, int y, int w, int h, int colorIdx);
void draw_text(int x, int y, const char* text, int colorIdx, int fontSize);
void log_console(const char* text);

// Colors (Index matches JS side)
#define BLACK 0
#define WHITE 1
#define RED 2
#define GREEN 3
#define BLUE 4
#define GRAY 5
#define DARK_GRAY 6
#define LIGHT_GRAY 7
#define ORANGE 8

int screen_width = 400;
int screen_height = 600;

// Calculator State
long long current_value = 0;
long long pending_value = 0;
char last_op = 0; // 0: none, 1: +, 2: -, 3: *, 4: /
int input_active = 0; // 0: showing result, 1: typing

// Button Layout
typedef struct {
    int x, y, w, h;
    const char* label;
    int color;
    int type; // 0: number, 1: op, 2: clear, 3: equals
    int value; // for numbers
    char op; // for ops
} Button;

#define BTN_SIZE 80
#define BTN_GAP 10
#define START_X 20
#define START_Y 150

Button buttons[16];
int btn_count = 0;

void add_btn(const char* label, int col, int row, int type, int val, char op, int color) {
    buttons[btn_count].label = label;
    buttons[btn_count].x = START_X + col * (BTN_SIZE + BTN_GAP);
    buttons[btn_count].y = START_Y + row * (BTN_SIZE + BTN_GAP);
    buttons[btn_count].w = BTN_SIZE;
    buttons[btn_count].h = BTN_SIZE;
    buttons[btn_count].type = type;
    buttons[btn_count].value = val;
    buttons[btn_count].op = op;
    buttons[btn_count].color = color;
    btn_count++;
}

// Custom itoa for display
void int_to_str(long long val, char* buf) {
    if (val == 0) {
        buf[0] = '0';
        buf[1] = '\0';
        return;
    }
    
    int i = 0;
    int sign = 0;
    if (val < 0) {
        sign = 1;
        val = -val;
    }
    
    // Extract digits
    char temp[32];
    int temp_idx = 0;
    while (val > 0) {
        temp[temp_idx++] = (val % 10) + '0';
        val /= 10;
    }
    
    if (sign) {
        buf[i++] = '-';
    }
    
    // Reverse
    while (temp_idx > 0) {
        buf[i++] = temp[--temp_idx];
    }
    buf[i] = '\0';
}

void init() {
    // Setup keypad
    // Row 0
    add_btn("7", 0, 0, 0, 7, 0, DARK_GRAY);
    add_btn("8", 1, 0, 0, 8, 0, DARK_GRAY);
    add_btn("9", 2, 0, 0, 9, 0, DARK_GRAY);
    add_btn("/", 3, 0, 1, 0, 4, ORANGE);
    
    // Row 1
    add_btn("4", 0, 1, 0, 4, 0, DARK_GRAY);
    add_btn("5", 1, 1, 0, 5, 0, DARK_GRAY);
    add_btn("6", 2, 1, 0, 6, 0, DARK_GRAY);
    add_btn("*", 3, 1, 1, 0, 3, ORANGE);

    // Row 2
    add_btn("1", 0, 2, 0, 1, 0, DARK_GRAY);
    add_btn("2", 1, 2, 0, 2, 0, DARK_GRAY);
    add_btn("3", 2, 2, 0, 3, 0, DARK_GRAY);
    add_btn("-", 3, 2, 1, 0, 2, ORANGE);

    // Row 3
    add_btn("C", 0, 3, 2, 0, 0, RED);
    add_btn("0", 1, 3, 0, 0, 0, DARK_GRAY);
    add_btn("=", 2, 3, 3, 0, 0, GREEN);
    add_btn("+", 3, 3, 1, 0, 1, ORANGE);
}

void render() {
    // 1. Clear Background
    clear_screen(BLACK);
    
    // 2. Draw Display Area
    draw_rect(20, 20, 350, 100, DARK_GRAY);
    
    // 3. Draw Number
    char buf[64];
    int_to_str(input_active ? current_value : (last_op && !input_active ? pending_value : current_value), buf);
    draw_text(40, 90, buf, WHITE, 60);

    // 4. Draw Buttons
    for (int i = 0; i < btn_count; i++) {
        draw_rect(buttons[i].x, buttons[i].y, buttons[i].w, buttons[i].h, buttons[i].color);
        // Center text roughly
        draw_text(buttons[i].x + 30, buttons[i].y + 55, buttons[i].label, WHITE, 40);
    }
}

void calculate() {
    switch(last_op) {
        case 1: pending_value += current_value; break;
        case 2: pending_value -= current_value; break;
        case 3: pending_value *= current_value; break;
        case 4: 
            if (current_value != 0) pending_value /= current_value; 
            else pending_value = 0; // Error handling
            break;
    }
}

void on_click(int x, int y) {
    for (int i = 0; i < btn_count; i++) {
        if (x >= buttons[i].x && x <= buttons[i].x + buttons[i].w &&
            y >= buttons[i].y && y <= buttons[i].y + buttons[i].h) {
            
            Button* b = &buttons[i];
            
            if (b->type == 0) { // Number
                if (!input_active) {
                    current_value = 0;
                    input_active = 1;
                }
                current_value = current_value * 10 + b->value;
            } else if (b->type == 1) { // Operator
                if (last_op != 0 && input_active) {
                    calculate();
                } else if (last_op == 0) {
                    pending_value = current_value;
                }
                last_op = b->op;
                input_active = 0;
                current_value = 0; // Reset for next input
            } else if (b->type == 2) { // Clear
                current_value = 0;
                pending_value = 0;
                last_op = 0;
                input_active = 0;
            } else if (b->type == 3) { // Equals
                if (last_op != 0) {
                    calculate();
                    current_value = pending_value; 
                    last_op = 0;
                    input_active = 0; // Show result
                    // pending_value remains as result
                }
            }
            
            return;
        }
    }
}
