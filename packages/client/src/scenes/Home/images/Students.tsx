import { WithStyles, withStyles } from '@material-ui/core';
import * as React from 'react';

import { styles } from './ImageStyles';

interface Props extends WithStyles<typeof styles> { }

export default withStyles(styles)(({ classes }: Props) => (
  <svg
    className={classes.icon}
    version="1.1"
    x="0"
    y="0"
    width="150px"
    height="150px"
    viewBox="0 0 23 23"
  >
    <g 
     id="surface1"
    >
        <path 
            id="svg_2"
            fill="#466D3B" 
            d="M 11.894531 0.527344 
            C 11.308594 0.800781 10.726562 1.417969 10.550781 1.953125 
            C 10.40625 2.414062 10.425781 3.160156 10.597656 3.585938 
            C 10.792969 4.042969 10.792969 4.035156 10.53125 4.582031 
            C 10.328125 4.996094 10.328125 5.054688 10.453125 5.171875
            C 10.589844 5.292969 10.667969 5.285156 11.171875 5.074219
            C 11.726562 4.855469 11.757812 4.855469 12.085938 4.996094
            C 12.273438 5.074219 12.71875 5.164062 13.078125 5.1875 
            L 13.730469 5.242188 L 13.535156 4.722656 
            C 13.390625 4.324219 13.351562 4.042969 13.382812 3.53125 
            C 13.4375 2.632812 13.761719 2.035156 14.539062 1.398438 
            L 15.113281 0.921875 L 14.753906 0.703125 
            C 14.207031 0.386719 13.800781 0.28125 13.070312 0.28125 
            C 12.535156 0.28125 12.3125 0.324219 11.894531 0.527344 Z 
            M 14.226562 0.730469 L 14.65625 0.898438 L 14.1875 1.320312 
            C 13.914062 1.558594 13.585938 1.980469 13.421875 2.308594 
            C 13.15625 2.808594 13.117188 2.976562 13.117188 3.628906 
            C 13.117188 4.042969 13.15625 4.511719 13.207031 4.675781 
            L 13.285156 4.976562 L 12.867188 4.914062 
            C 12.632812 4.878906 12.28125 4.785156 12.085938 4.695312 
            C 11.746094 4.546875 11.707031 4.546875 11.40625 4.6875 
            C 11.222656 4.773438 10.980469 4.871094 10.863281 4.898438 
            L 10.648438 4.960938 L 10.882812 4.484375 L 11.125 4.007812 L 10.929688 3.621094 
            C 10.53125 2.816406 10.734375 1.796875 11.417969 1.179688 
            C 12.183594 0.472656 13.1875 0.316406 14.226562 0.730469 Z M 14.226562 0.730469 "
        />
        <path 
            id="svg_3"
            fill="#F7D42C" 
            d="M 15.636719 0.992188 
            C 14.664062 1.328125 13.964844 2.070312 13.691406 3.03125 
            C 13.3125 4.351562 14.089844 5.8125 15.492188 6.386719 
            C 15.820312 6.527344 16.152344 6.582031 16.804688 6.589844 
            C 17.671875 6.609375 17.679688 6.609375 18.117188 6.953125 
            C 18.699219 7.402344 18.757812 7.425781 18.953125 7.355469 
            C 19.101562 7.3125 19.121094 7.214844 19.0625 6.609375 
            C 19.003906 5.929688 19.003906 5.910156 19.285156 5.585938 
            C 19.789062 5.011719 20.003906 4.457031 20.015625 3.699219 
            C 20.015625 3.117188 19.964844 2.949219 19.691406 2.449219 
            C 19.121094 1.390625 18.078125 0.800781 16.785156 0.816406 
            C 16.386719 0.816406 15.949219 0.886719 15.636719 0.992188 Z 
            M 18.039062 1.277344 C 19.101562 1.742188 19.722656 2.632812 19.730469 3.664062 
            C 19.730469 4.394531 19.539062 4.90625 19.03125 5.460938 
            L 18.679688 5.851562 L 18.777344 6.476562 
            C 18.835938 6.828125 18.867188 7.128906 18.847656 7.144531 
            C 18.828125 7.164062 18.574219 6.976562 18.273438 6.738281 
            L 17.738281 6.300781 L 16.96875 6.34375 
            C 16.296875 6.378906 16.132812 6.351562 15.675781 6.167969 
            C 14.945312 5.867188 14.488281 5.46875 14.167969 4.878906 
            C 13.800781 4.210938 13.789062 3.285156 14.128906 2.589844 
            C 14.402344 2.042969 15.132812 1.40625 15.726562 1.214844 
            C 16.28125 1.027344 17.5625 1.0625 18.039062 1.277344 Z 
            M 18.039062 1.277344 "
        />
        <path 
            id="svg_4"
            d="M 13.710938 5.980469 
            C 13.652344 6.113281 13.789062 6.265625 13.964844 6.273438 
            C 14.101562 6.273438 14.148438 6.078125 14.042969 5.964844 
            C 13.886719 5.796875 13.789062 5.796875 13.710938 5.980469 Z 
            M 13.710938 5.980469 "
        />
        <path 
            id="svg_5"
            d="M 0.648438 11.886719 
            C 0.515625 11.929688 0.476562 12.230469 0.601562 12.300781 
            C 0.640625 12.316406 0.726562 12.316406 0.777344 12.28125 
            C 0.914062 12.195312 0.796875 11.84375 0.648438 11.886719 Z 
            M 0.648438 11.886719 "
        />
        <path 
            id="svg_6"
            fill="black" 
            d="M 16.699219 8.527344 
            C 16.53125 8.609375 16.269531 8.777344 16.105469 8.898438 
            C 15.753906 9.191406 15.316406 9.972656 15.316406 10.308594 
            C 15.316406 10.441406 15.308594 10.660156 15.296875 10.800781 
            C 15.269531 11.296875 15.851562 11.472656 16.066406 11.03125 
            C 16.144531 10.871094 16.296875 10.742188 16.433594 10.714844 
            C 16.582031 10.679688 16.660156 10.609375 16.628906 10.539062 
            C 16.601562 10.476562 16.550781 10.195312 16.511719 9.902344 
            C 16.453125 9.4375 16.472656 9.355469 16.660156 9.191406 
            C 16.832031 9.03125 16.941406 9.011719 17.417969 9.058594 
            C 17.980469 9.109375 18.515625 8.996094 18.515625 8.828125 
            C 18.515625 8.785156 18.429688 8.660156 18.320312 8.5625 
            C 18.078125 8.34375 17.164062 8.324219 16.699219 8.527344 Z 
            M 16.988281 9.277344 
            C 16.929688 9.347656 16.910156 9.621094 16.960938 10.007812 
            L 17.027344 10.636719 L 17.496094 10.636719 
            C 17.855469 10.636719 17.972656 10.601562 17.972656 10.503906 
            C 17.972656 10.433594 18.019531 10.371094 18.070312 10.371094 
            C 18.242188 10.371094 18.554688 9.804688 18.554688 9.488281 
            L 18.554688 9.179688 L 17.824219 9.171875 
            C 17.347656 9.171875 17.058594 9.207031 16.988281 9.277344 Z 
            M 16.988281 9.277344 "
        />
        <path 
            fill="black"
            id="svg_7"
            d="M 18.566406 9.375 
            C 18.644531 9.691406 18.679688 9.761719 18.757812 9.691406 
            C 18.835938 9.621094 18.691406 9.09375 18.59375 9.09375 
            C 18.535156 9.09375 18.527344 9.214844 18.566406 9.375 Z 
            M 19.34375 8.976562 
            C 18.847656 9.136719 18.75 9.226562 18.875 9.390625 
            C 18.972656 9.535156 20.0625 9.347656 20.0625 9.199219 
            C 20.0625 9.039062 19.957031 8.8125 19.878906 8.820312 
            C 19.847656 8.828125 19.605469 8.898438 19.34375 8.976562 Z 
            M 19.632812 9.5 
            C 19.382812 9.628906 19.410156 9.859375 19.683594 9.824219 
            C 19.820312 9.804688 19.90625 9.726562 19.925781 9.59375 
            C 19.964844 9.382812 19.886719 9.355469 19.632812 9.5 Z 
            M 20.511719 8.617188 
            C 20.160156 8.714844 20.121094 8.75 20.148438 8.976562 
            C 20.1875 9.320312 20.246094 9.347656 20.734375 9.261719 
            C 21.113281 9.179688 21.140625 9.164062 21.082031 8.941406 
            C 20.976562 8.527344 20.929688 8.511719 20.511719 8.617188 Z 
            M 21.578125 8.148438 
            C 21.257812 8.253906 20.996094 8.375 20.996094 8.421875 
            C 21.007812 8.703125 21.171875 9.160156 21.257812 9.160156 
            C 21.316406 9.160156 21.648438 9.117188 21.988281 9.0625 
            C 22.511719 8.976562 22.609375 8.941406 22.660156 8.746094 
            C 22.699219 8.632812 22.679688 8.445312 22.609375 8.339844 
            C 22.523438 8.171875 22.511719 8.199219 22.550781 8.5 
            C 22.601562 8.835938 22.589844 8.835938 22.503906 8.585938 
            C 22.445312 8.4375 22.425781 8.253906 22.445312 8.164062 
            C 22.464844 8.085938 22.445312 8.03125 22.398438 8.066406 
            C 22.347656 8.09375 22.308594 8.066406 22.308594 8.023438 
            C 22.308594 7.902344 22.28125 7.910156 21.578125 8.148438 Z 
            M 21.578125 8.148438 "
        />
        <path 
            id="svg_8"
            fill="#4A8CF2"  
            d="M 19.847656 10.042969 
            C 19.703125 10.070312 19.683594 10.140625 19.730469 10.527344 
            C 19.761719 10.785156 19.808594 11.171875 19.839844 11.402344 
            C 19.859375 11.640625 19.859375 11.824219 19.839844 11.824219 
            C 19.808594 11.824219 19.449219 11.628906 19.042969 11.382812 
            C 18.214844 10.890625 17.972656 10.835938 17.007812 10.871094 
            L 16.328125 10.898438 L 16.203125 11.242188 
            C 16.132812 11.429688 15.878906 12.617188 15.648438 13.886719 
            C 15.402344 15.148438 15.179688 16.292969 15.152344 16.425781 
            C 15.113281 16.628906 15.140625 16.664062 15.394531 16.714844 
            C 15.773438 16.785156 16.601562 16.574219 17.496094 16.167969 
            C 17.875 16 18.203125 15.835938 18.242188 15.800781 
            C 18.292969 15.765625 18.390625 15.007812 18.476562 14.117188 
            C 18.566406 13.21875 18.644531 12.476562 18.660156 12.460938 
            C 18.671875 12.449219 18.992188 12.566406 19.371094 12.714844 
            C 19.847656 12.910156 20.140625 12.96875 20.316406 12.933594 
            C 20.742188 12.839844 20.761719 12.589844 20.414062 11.261719 
            C 20.238281 10.601562 20.082031 10.042969 20.0625 10.027344 
            C 20.042969 10.019531 19.945312 10.019531 19.847656 10.042969 Z 
            M 19.847656 10.042969 "
        />
        <path 
            id="svg_9"
            fill="black" 
            d="M 18.351562 15.949219 
            C 18.011719 16.195312 16.589844 16.757812 16.085938 16.855469 
            C 15.707031 16.925781 15.511719 16.925781 15.335938 16.855469 
            L 15.09375 16.757812 L 15.160156 17.304688 
            C 15.199219 17.613281 15.375 18.390625 15.558594 19.042969 
            C 15.734375 19.695312 15.871094 20.242188 15.859375 20.25 
            C 15.804688 20.300781 12.582031 21.078125 12.4375 21.078125 
            C 12.300781 21.078125 12.28125 21.132812 12.332031 21.351562 
            C 12.359375 21.5 12.390625 21.660156 12.390625 21.703125 
            C 12.390625 21.898438 12.671875 21.757812 12.71875 21.535156 
            L 12.777344 21.296875 L 15.023438 21.324219 
            C 16.261719 21.34375 17.378906 21.332031 17.515625 21.296875 
            C 17.660156 21.273438 17.796875 21.140625 17.882812 20.964844 
            C 17.992188 20.714844 17.980469 20.53125 17.726562 19.367188 
            C 17.574219 18.644531 17.457031 18.046875 17.476562 18.027344 
            C 17.535156 17.976562 20.566406 17.789062 20.617188 17.84375 
            C 20.644531 17.871094 20.453125 18.664062 20.179688 19.597656 
            C 19.90625 20.539062 19.683594 21.421875 19.683594 21.546875 
            C 19.683594 21.757812 19.722656 21.78125 20.015625 21.78125 
            C 20.441406 21.78125 20.550781 21.640625 20.21875 21.5 
            C 20.0625 21.4375 19.984375 21.351562 20.023438 21.273438 
            C 20.054688 21.203125 20.578125 20.300781 21.199219 19.28125 
            C 21.824219 18.257812 22.347656 17.296875 22.378906 17.15625 
            C 22.472656 16.617188 22.25 16.511719 20.296875 16.152344 
            C 18.757812 15.871094 18.507812 15.84375 18.351562 15.949219 Z 
            M 18.351562 15.949219 "
        />
        <path 
            fill="black"
            id="svg_10"
            d="M 7.554688 7.199219 
            C 6.824219 7.480469 6.582031 8.667969 7.175781 9.023438 
            C 7.351562 9.128906 7.476562 9.101562 7.351562 8.988281 
            C 7.050781 8.714844 7.359375 7.945312 7.769531 7.945312 
            C 7.855469 7.945312 7.914062 7.867188 7.914062 7.761719 
            C 7.914062 7.585938 7.945312 7.578125 8.683594 7.636719 
            L 9.453125 7.699219 L 9.609375 7.4375 L 9.753906 7.179688 
            L 9.246094 7.117188 C 8.460938 7.039062 7.894531 7.066406 7.554688 7.199219 Z 
            M 8.042969 8.078125 
            C 8.042969 8.289062 8.023438 8.308594 7.90625 8.230469 
            C 7.664062 8.042969 7.359375 8.265625 7.359375 8.617188 
            C 7.359375 8.777344 7.410156 8.941406 7.457031 8.96875 
            C 7.515625 8.996094 7.554688 9.25 7.554688 9.535156 
            C 7.554688 10.089844 7.664062 10.246094 8.042969 10.246094 
            C 8.363281 10.246094 8.527344 10.097656 8.527344 9.804688 
            C 8.527344 9.640625 8.597656 9.558594 8.808594 9.480469 
            C 9.207031 9.347656 9.421875 9.003906 9.492188 8.371094 
            L 9.558594 7.824219 L 8.042969 7.824219 Z 
            M 9.207031 8.609375 
            C 9.207031 8.652344 9.152344 8.75 9.082031 8.847656 
            C 8.984375 8.960938 8.878906 8.988281 8.695312 8.941406 
            C 8.34375 8.863281 8.363281 8.757812 8.75 8.644531 
            C 9.160156 8.527344 9.207031 8.519531 9.207031 8.609375 Z 
            M 9.207031 8.609375 "
        />
        <path 
            id="svg_11"
            fill="#EF7E66" 
            d="M 12.554688 7.746094 
            L 11.550781 9.136719 L 10.316406 9.585938 
            C 9.480469 9.894531 9.042969 10.007812 8.945312 9.957031 
            C 8.839844 9.902344 8.789062 9.914062 8.789062 10 
            C 8.789062 10.210938 8.421875 10.441406 8.101562 10.433594 
            C 7.644531 10.421875 7.429688 10.195312 7.429688 9.710938 
            L 7.429688 9.304688 L 6.796875 9.066406 
            C 6.3125 8.882812 6.117188 8.847656 5.921875 8.917969 
            C 5.785156 8.960938 5.183594 9.410156 4.570312 9.902344 
            C 3.546875 10.730469 3.355469 10.855469 2.253906 11.304688 
            C 1.28125 11.703125 1.050781 11.824219 1.03125 11.992188 
            C 1 12.152344 1.03125 12.1875 1.175781 12.152344 
            C 1.273438 12.125 1.894531 12.035156 2.566406 11.957031 
            C 3.566406 11.832031 3.871094 11.761719 4.25 11.550781 
            C 4.511719 11.410156 4.734375 11.296875 4.753906 11.296875 
            C 4.765625 11.296875 4.675781 11.585938 4.550781 11.949219 
            C 4.347656 12.53125 4.230469 13.085938 4.082031 14.046875 
            L 4.035156 14.378906 L 8.644531 14.378906 L 9.0625 13.429688 
            C 9.871094 11.59375 9.851562 11.621094 11.261719 10.765625 
            L 12.515625 10.007812 L 13.214844 8.246094 
            C 13.878906 6.597656 13.925781 6.371094 13.632812 6.359375 
            C 13.59375 6.359375 13.109375 6.988281 12.554688 7.746094 Z 
            M 12.554688 7.746094 "
        />
        <path 
            id="svg_12"
            fill="black" 
            d="M 4.152344 15.585938 
            C 4.191406 16.160156 4.199219 16.882812 4.171875 17.199219 
            C 4.113281 17.71875 4.054688 17.851562 3.480469 18.628906 
            C 3.128906 19.09375 2.535156 19.78125 2.148438 20.152344 
            L 1.449219 20.824219 L 1.738281 21.078125 
            C 2.136719 21.421875 2.214844 21.414062 2.148438 21.007812 
            C 2.089844 20.679688 2.097656 20.671875 2.78125 20.242188 
            C 3.898438 19.527344 5.191406 18.371094 5.445312 17.851562 
            C 5.648438 17.421875 6.019531 16.378906 6.261719 15.535156 
            L 6.378906 15.148438 L 7.875 16.503906 
            L 9.375 17.863281 L 9.324219 18.300781 
            C 9.132812 19.90625 8.945312 20.988281 8.828125 21.246094 
            C 8.75 21.402344 8.695312 21.546875 8.695312 21.5625 
            C 8.695312 21.617188 9.5 21.78125 9.550781 21.738281 
            C 9.589844 21.710938 9.558594 21.617188 9.492188 21.535156 
            C 9.421875 21.457031 9.34375 21.332031 9.316406 21.273438 
            C 9.285156 21.21875 9.453125 20.679688 9.703125 20.082031 
            C 9.949219 19.492188 10.257812 18.644531 10.394531 18.214844 
            L 10.648438 17.421875 L 10.269531 16.757812 
            C 10.066406 16.398438 9.644531 15.753906 9.335938 15.324219 
            L 8.78125 14.554688 L 4.074219 14.554688 Z M 4.152344 15.585938 "
        />
    </g>
  </svg>
));
