# Mobile Slider Setup Guide

## Admin Panel Settings Guide

Go to **Admin Panel → Slider Images → Edit Your Slider → Mobile View Settings**

### 1. **Mobile Image (Optional)**
- **What it does**: Upload a separate image optimized for mobile
- **Recommendation**: Upload a mobile-optimized image (usually portrait or square format)
- **If empty**: Desktop image will be used on mobile

### 2. **Mobile Height**
- **What it does**: Sets the fixed height of the slider container on mobile
- **Options**:
  - **Leave empty (Auto)**: Uses default 240px height with 16:9 aspect ratio
  - **Set value (20-1000px)**: Fixed height in pixels
- **Recommendation**: 
  - For portrait images: Try `300px` to `400px`
  - For landscape images: Try `200px` to `280px`
  - For square images: Try `300px` to `350px`

### 3. **Mobile Fit**
- **What it does**: Controls how the image fills the container
- **Options**:
  - **Cover** (Recommended): Image fills container, may crop edges
  - **Contain**: Full image visible, no cropping (may show empty space)
  - **Fill**: Stretches image to fill (may distort)
  - **Scale down**: Similar to contain
- **Recommendation**: Use **Cover** for best results

### 4. **Mobile Position**
- **What it does**: Controls which part of the image is visible
- **Options**:
  - **Center Center** (Recommended): Centers the image
  - **Top**: Shows top of image
  - **Bottom**: Shows bottom of image
  - **Left/Right**: Shows left/right side
  - Combinations: Top Left, Top Right, etc.
- **Recommendation**: 
  - For portraits: Use **Center Center** or **Top Center**
  - For landscapes: Use **Center Center** or **Left Center**

### 5. **Mobile Zoom**
- **What it does**: Zooms in/out the image (0.5x to 2.0x)
- **Options**:
  - **Leave empty**: Uses desktop zoom setting
  - **1.0**: Normal size (recommended)
  - **< 1.0**: Zoom out (shows more of image)
  - **> 1.0**: Zoom in (crops image more)
- **Recommendation**: Keep at **1.0** or leave empty

### 6. **Mobile Padding** (Inside the slider container)
- **What it does**: Adds space inside the slider container
- **Values**: 0-200px for each side
- **Recommendation**: Usually keep at **0** unless you need internal spacing

### 7. **Mobile Margin & Positioning** (Outside the slider container)
- **What it does**: Moves the entire slider up/down/left/right
- **Negative values**: Move slider UP (for top/left) or DOWN (for bottom/right)
- **Positive values**: Add space (push slider away)

#### **Margin Top**
- **Negative values** (e.g., -50px, -100px): Moves slider UP to cover white space at top
- **Positive values**: Adds space above slider
- **Recommendation**: Start with **-50px** to **-100px** to remove top white space

#### **Margin Right**
- **Negative values**: Moves slider LEFT
- **Positive values**: Adds space on right
- **Recommendation**: Usually **0** or small negative value if needed

#### **Margin Bottom**
- **Negative values**: Moves slider UP (reduces space below)
- **Positive values**: Adds space below slider
- **Recommendation**: Usually **0**

#### **Margin Left**
- **Negative values**: Moves slider RIGHT
- **Positive values**: Adds space on left
- **Recommendation**: Usually **0** or small negative value if needed

### 8. **Full Width (Remove Side Margins)**
- **What it does**: Makes slider span full screen width
- **Options**:
  - **Disabled**: Slider respects page margins/padding
  - **Enabled**: Slider breaks out and spans 100% width
- **Recommendation**: **Enable** if you want edge-to-edge slider

## Quick Setup Steps

1. **Upload Mobile Image**: Upload a mobile-optimized image
2. **Set Height**: Leave empty (auto) or set to 300-400px for portraits
3. **Set Fit**: Choose **Cover**
4. **Set Position**: Choose **Center Center**
5. **Set Margin Top**: Start with **-50px** to remove top white space
6. **Enable Full Width**: Toggle ON if you want full-width slider
7. **Save and Test**: Check on mobile device or browser mobile view

## Troubleshooting

- **Too much white space at top**: Increase negative Margin Top (e.g., -100px)
- **Image cut off**: Change Mobile Position or reduce Mobile Zoom
- **Image too small**: Increase Mobile Height or adjust Mobile Zoom
- **Side margins visible**: Enable Full Width toggle
- **Image not filling**: Change Mobile Fit to "Cover"
