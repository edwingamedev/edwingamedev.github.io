document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.querySelector(".skills-tree-viewport");
  if (!viewport) return;

  const canvas = viewport.querySelector(".skills-tree-canvas");
  const svg = viewport.querySelector(".skills-tree-connections");
  const root = viewport.querySelector(".skills-tree-root");
  const branches = [...viewport.querySelectorAll(".skills-tree-branch")];

  if (!canvas || !svg || !root || !branches.length) return;

  const SVG_NS = "http://www.w3.org/2000/svg";

  /* =======================================================
     CONFIGURATION
     ======================================================= */

  const BRANCH_POSITIONS = {
    "top-left": { x: -250, y: -275 },
    "top-right": { x: 250, y: -275 },
    left: { x: -410, y: 0 },
    right: { x: 410, y: 0 },
    "bottom-left": { x: -250, y: 275 },
    "bottom-right": { x: 250, y: 275 },
  };

  const DIRECTIONS = {
    "top-left": [-0.43, -0.9],
    "top-right": [0.43, -0.9],
    left: [-1, 0],
    right: [1, 0],
    "bottom-left": [-0.43, 0.9],
    "bottom-right": [0.43, 0.9],
  };

  const LAYOUT = {
    margin: 110,
    mainDistance: 155,
    groupDistance: 205,
    groupSpread: 155,
    leafDistance: 205,
    leafSpread: 142,
    jitter: 17,
  };

  /* =======================================================
     SVG ICONS
     ======================================================= */

  const ICONS = {
    gamepad: `
      <path d="M6 12h12c2 0 3 2 4 6l.5 2c.3 2-2 3-3.5 1l-3-3H8l-3 3c-1.5 2-3.8 1-3.5-1L2 18c1-4 2-6 4-6Z"/>
      <path d="M8 14v5M5.5 16.5h5"/>
      <circle cx="16" cy="15" r="1"/>
      <circle cx="19" cy="17" r="1"/>
    `,
    network: `
      <rect x="9" y="2" width="6" height="6" rx="1"/>
      <rect x="2" y="16" width="6" height="6" rx="1"/>
      <rect x="16" y="16" width="6" height="6" rx="1"/>
      <path d="M12 8v4M5 16v-4h14v4"/>
    `,
    calendar: `
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M7 3v4M17 3v4M3 10h18"/>
      <path d="M8 14h3M8 17h3M15 14h2"/>
    `,
    wrench: `
      <path d="M14.7 6.3a6 6 0 0 0-7.5 7.5L3 17.5a2.5 2.5 0 0 0 3.5 3.5l6.7-6.7a6 6 0 0 0 7.5-7.5l-4 4-4-1  -1-4 3.5-3.5Z"/>
    `,
    plug: `
      <path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 0 1-10 0V8Z"/>
      <path d="M12 17v5M9 22h6"/>
    `,
    gauge: `
      <path d="M4.5 19a9 9 0 1 1 15 0"/>
      <path d="M12 14l4-5"/>
      <circle cx="12" cy="14" r="2"/>
      <path d="M6 19h12"/>
    `,
    zoomIn: `
      <circle cx="10.5" cy="10.5" r="7"/>
      <path d="m16 16 5 5M10.5 7v7M7 10.5h7"/>
    `,
    zoomOut: `
      <circle cx="10.5" cy="10.5" r="7"/>
      <path d="m16 16 5 5M7 10.5h7"/>
    `,
    fit: `
      <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>
      <path d="m3 3 6 6m12-6-6 6M3 21l6-6m12 6-6-6"/>
    `,
  };

  const createIcon = (name) => {
    const markup = ICONS[name];
    if (!markup) return null;

    const icon = document.createElementNS(SVG_NS, "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = markup;

    return icon;
  };

  viewport.querySelectorAll("[data-icon]").forEach((element) => {
    const icon = createIcon(element.dataset.icon);
    if (icon) element.replaceChildren(icon);
  });

  /* =======================================================
     STATE
     ======================================================= */

  const pointers = new Map();

  let scale = 1;
  let minScale = 0.25;
  let maxScale = 2.5;

  let translateX = 0;
  let translateY = 0;

  let treeWidth = 1;
  let treeHeight = 1;

  let lastPointer = null;
  let lastPinch = null;

  /* =======================================================
     GENERAL HELPERS
     ======================================================= */

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const add = (a, b) => ({
    x: a.x + b.x,
    y: a.y + b.y,
  });

  const multiply = (vector, amount) => ({
    x: vector.x * amount,
    y: vector.y * amount,
  });

  const normalize = ([x, y]) => {
    const length = Math.hypot(x, y) || 1;

    return {
      x: x / length,
      y: y / length,
    };
  };

  // Stable variation based on the node's name.
  const variation = (text, salt = 0) => {
    let hash = 2166136261;

    for (const char of `${text}:${salt}`) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }

    return ((hash >>> 0) / 4294967295) * 2 - 1;
  };

  const place = (element, point) => {
    element.style.left = `${point.x}px`;
    element.style.top = `${point.y}px`;
  };

  const applyTransform = () => {
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  };

  /* =======================================================
     SVG CONNECTIONS
     ======================================================= */

  /* =======================================================
   CONNECTION ROUTING
   ======================================================= */

  const ROUTE_PADDING = 14;

  // Check whether a point is inside a rectangle.
  const pointInsideRect = (point, rect) =>
    point.x > rect.left && point.x < rect.right && point.y > rect.top && point.y < rect.bottom;

  // Check whether a line segment crosses a rectangle.

  const segmentCrossesRect = (a, b, rect) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    let tMin = 0;
    let tMax = 1;

    const axes = [
      [a.x, dx, rect.left, rect.right],
      [a.y, dy, rect.top, rect.bottom],
    ];

    for (const [start, delta, min, max] of axes) {
      if (Math.abs(delta) < 0.000001) {
        // Parallel to this axis.
        // No intersection if outside its interval.
        if (start < min || start > max) {
          return false;
        }

        continue;
      }

      let t1 = (min - start) / delta;
      let t2 = (max - start) / delta;

      if (t1 > t2) {
        [t1, t2] = [t2, t1];
      }

      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);

      if (tMin > tMax) {
        return false;
      }
    }

    return tMin <= tMax;
  };

  // Find a path that avoids all blocking nodes.
  const routeConnection = (from, to, nodeBounds) => {
    /*
     * A connection may start or end inside its own node.
     * Those endpoint nodes are not obstacles.
     */
    const obstacles = nodeBounds.filter(
      (rect) => !pointInsideRect(from, rect) && !pointInsideRect(to, rect)
    );

    const isClear = (a, b) => obstacles.every((rect) => !segmentCrossesRect(a, b, rect));

    // Keep straight lines whenever possible.
    if (isClear(from, to)) {
      return [from, to];
    }

    /*
     * Create candidate waypoints around obstacles.
     * Each corner lies slightly outside the node bounds.
     */
    const points = [from, to];

    obstacles.forEach((rect) => {
      const gap = 2;

      points.push(
        { x: rect.left - gap, y: rect.top - gap },
        { x: rect.right + gap, y: rect.top - gap },
        { x: rect.right + gap, y: rect.bottom + gap },
        { x: rect.left - gap, y: rect.bottom + gap }
      );
    });

    /*
     * Dijkstra over visible waypoint connections.
     * Cost is the total length of the route.
     */
    const distances = new Array(points.length).fill(Infinity);
    const previous = new Array(points.length).fill(-1);
    const visited = new Set();

    distances[0] = 0;

    while (visited.size < points.length) {
      let current = -1;
      let best = Infinity;

      for (let i = 0; i < points.length; i++) {
        if (!visited.has(i) && distances[i] < best) {
          best = distances[i];
          current = i;
        }
      }

      if (current === -1 || current === 1) break;

      visited.add(current);

      for (let next = 0; next < points.length; next++) {
        if (next === current || visited.has(next)) continue;

        if (!isClear(points[current], points[next])) continue;

        const distance = Math.hypot(
          points[next].x - points[current].x,
          points[next].y - points[current].y
        );

        const newDistance = distances[current] + distance;

        if (newDistance < distances[next]) {
          distances[next] = newDistance;
          previous[next] = current;
        }
      }
    }

    if (!Number.isFinite(distances[1])) {
      console.warn("Could not find unobstructed skill connection");
      return [from, to];
    }

    const route = [];
    let index = 1;

    while (index !== -1) {
      route.unshift(points[index]);
      index = previous[index];
    }

    return route;
  };

  const createConnection = (from, to, className, nodeBounds) => {
    const route = routeConnection(from, to, nodeBounds);

    const path = document.createElementNS(SVG_NS, "path");

    const pathData = route
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    path.setAttribute("d", pathData);
    path.setAttribute("class", className);

    svg.appendChild(path);
  };

  const createSupport = (position, isMain) => {
    const circle = document.createElementNS(SVG_NS, "circle");

    circle.setAttribute("cx", position.x);
    circle.setAttribute("cy", position.y);
    circle.setAttribute("r", isMain ? 5 : 3.5);
    circle.setAttribute("class", isMain ? "skills-tree-support is-main" : "skills-tree-support");

    svg.appendChild(circle);
  };

  /* =======================================================
     ORGANIC BRANCH LAYOUT
     ======================================================= */

  const splitIntoGroups = (skills) => {
    if (skills.length <= 3) return [skills];

    const midpoint = Math.ceil(skills.length / 2);

    return [skills.slice(0, midpoint), skills.slice(midpoint)];
  };

  const createBranchLayout = (branch, nodes, connections, supports) => {
    const directionName = branch.dataset.direction;
    const categoryPosition = BRANCH_POSITIONS[directionName];
    const directionArray = DIRECTIONS[directionName];

    const category = branch.querySelector(".skills-tree-category");
    const skills = [...branch.querySelectorAll(".skills-tree-node")];

    if (!categoryPosition || !directionArray || !category) {
      console.warn("Invalid skill branch:", directionName);
      return;
    }

    const forward = normalize(directionArray);
    const sideways = {
      x: -forward.y,
      y: forward.x,
    };

    nodes.push({
      element: category,
      position: categoryPosition,
    });

    // Connection from Skills to this specialization.
    connections.push({
      from: { x: 0, y: 0 },
      to: categoryPosition,
      type: "root",
    });

    if (!skills.length) return;

    // Main support node.
    const mainSupport = add(categoryPosition, multiply(forward, LAYOUT.mainDistance));

    supports.push({
      position: mainSupport,
      isMain: true,
    });

    connections.push({
      from: categoryPosition,
      to: mainSupport,
      type: "trunk",
    });

    // Automatically distribute leaves into sub-branches.
    const groups = splitIntoGroups(skills);

    groups.forEach((group, groupIndex) => {
      const groupOffset = (groupIndex - (groups.length - 1) / 2) * LAYOUT.groupSpread * 2;

      const groupSupport = add(
        add(mainSupport, multiply(forward, LAYOUT.groupDistance)),
        multiply(sideways, groupOffset)
      );

      supports.push({
        position: groupSupport,
        isMain: false,
      });

      connections.push({
        from: mainSupport,
        to: groupSupport,
        type: "branch",
      });

      group.forEach((skill, index) => {
        const label = skill.textContent.trim();

        const leafOffset = (index - (group.length - 1) / 2) * LAYOUT.leafSpread * 1.75;

        const forwardJitter = variation(label, 1) * LAYOUT.jitter;

        const sidewaysJitter = variation(label, 2) * LAYOUT.jitter;

        const leafPosition = add(
          add(groupSupport, multiply(forward, LAYOUT.leafDistance + forwardJitter)),
          multiply(sideways, leafOffset + sidewaysJitter)
        );

        nodes.push({
          element: skill,
          position: leafPosition,
          type: "leaf",
        });

        connections.push({
          from: groupSupport,
          to: leafPosition,
          type: "leaf",
        });
      });
    });
  };

  /* =======================================================
   COLLISION RESOLUTION
   ======================================================= */

  const resolveCollisions = (nodes) => {
    const PADDING = 28;
    const MAX_ITERATIONS = 200;
    const EPSILON = 0.01;

    const getBounds = (node) => {
      const width = node.element.offsetWidth;
      const height = node.element.offsetHeight;

      return {
        left: node.position.x - width / 2,
        right: node.position.x + width / 2,
        top: node.position.y - height / 2,
        bottom: node.position.y + height / 2,
      };
    };

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      let collisions = 0;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];

          const aMovable = a.type === "leaf";
          const bMovable = b.type === "leaf";

          if (!aMovable && !bMovable) continue;

          const boundsA = getBounds(a);
          const boundsB = getBounds(b);

          const overlapX =
            Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);

          const overlapY =
            Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);

          /*
           * Ignore nodes that already have enough space
           * between them.
           */
          if (overlapX <= -PADDING || overlapY <= -PADDING) {
            continue;
          }

          collisions++;

          const displacementX = overlapX + PADDING;
          const displacementY = overlapY + PADDING;

          const moveX = displacementX < displacementY;

          /*
           * Separate nodes along the axis that requires
           * the shortest movement.
           */
          const difference = moveX ? b.position.x - a.position.x : b.position.y - a.position.y;

          const sign = difference < -EPSILON ? -1 : 1;
          const amount = moveX ? displacementX : displacementY;

          const movableCount = Number(aMovable) + Number(bMovable);

          const movement = amount / movableCount;

          if (moveX) {
            if (aMovable) {
              a.position.x -= sign * movement;
            }

            if (bMovable) {
              b.position.x += sign * movement;
            }
          } else {
            if (aMovable) {
              a.position.y -= sign * movement;
            }

            if (bMovable) {
              b.position.y += sign * movement;
            }
          }
        }
      }

      if (collisions === 0) break;
    }
  };

  /* =======================================================
     TREE RENDERING
     ======================================================= */

  const layoutTree = () => {
    const nodes = [
      {
        element: root,
        position: { x: 0, y: 0 },
      },
    ];

    const connections = [];
    const supports = [];

    branches.forEach((branch) => {
      createBranchLayout(branch, nodes, connections, supports);
    });

    // Resolve overlaps after generating every branch.
    resolveCollisions(nodes);

    // Calculate bounds from actual rendered node sizes.
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const include = (point, halfWidth = 0, halfHeight = 0) => {
      minX = Math.min(minX, point.x - halfWidth);
      minY = Math.min(minY, point.y - halfHeight);
      maxX = Math.max(maxX, point.x + halfWidth);
      maxY = Math.max(maxY, point.y + halfHeight);
    };

    nodes.forEach(({ element, position }) => {
      include(position, element.offsetWidth / 2, element.offsetHeight / 2);
    });

    supports.forEach(({ position }) => include(position));

    const offset = {
      x: LAYOUT.margin - minX,
      y: LAYOUT.margin - minY,
    };

    treeWidth = maxX - minX + LAYOUT.margin * 2;
    treeHeight = maxY - minY + LAYOUT.margin * 2;

    canvas.style.width = `${treeWidth}px`;
    canvas.style.height = `${treeHeight}px`;

    svg.setAttribute("viewBox", `0 0 ${treeWidth} ${treeHeight}`);

    svg.setAttribute("width", treeWidth);
    svg.setAttribute("height", treeHeight);

    nodes.forEach(({ element, position }) => {
      place(element, add(position, offset));
    });

    svg.replaceChildren();

    svg.replaceChildren();

    // Build collision boundaries around visible nodes.
    const nodeBounds = nodes.map(({ element, position }) => {
      const center = add(position, offset);

      const halfWidth = element.offsetWidth / 2 + ROUTE_PADDING;

      const halfHeight = element.offsetHeight / 2 + ROUTE_PADDING;

      return {
        left: center.x - halfWidth,
        right: center.x + halfWidth,
        top: center.y - halfHeight,
        bottom: center.y + halfHeight,
      };
    });

    // Draw each connection exactly once.
    connections.forEach(({ from, to, type }) => {
      const className = {
        root: "is-root-connection",
        trunk: "is-trunk-connection",
        branch: "is-branch-connection",
        leaf: "is-leaf-connection",
      }[type];

      createConnection(add(from, offset), add(to, offset), className, nodeBounds);
    });

    // Draw support points above the connections.
    supports.forEach(({ position, isMain }) => {
      createSupport(add(position, offset), isMain);
    });
  };

  /* =======================================================
     ZOOM
     ======================================================= */

  const zoomAt = (clientX, clientY, newScale) => {
    const rect = viewport.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const targetScale = clamp(newScale, minScale, maxScale);
    const ratio = targetScale / scale;

    translateX = x - (x - translateX) * ratio;
    translateY = y - (y - translateY) * ratio;

    scale = targetScale;
    applyTransform();
  };

  const zoomCenter = (factor) => {
    const rect = viewport.getBoundingClientRect();

    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, scale * factor);
  };

  const fitToView = () => {
    if (!viewport.clientWidth || !viewport.clientHeight) return;

    const availableWidth = Math.max(1, viewport.clientWidth - 32);

    const availableHeight = Math.max(1, viewport.clientHeight - 32);

    const fitScale = Math.min(availableWidth / treeWidth, availableHeight / treeHeight);

    minScale = fitScale;
    maxScale = Math.max(2.5, fitScale * 3);
    scale = fitScale;

    translateX = (viewport.clientWidth - treeWidth * scale) / 2;

    translateY = (viewport.clientHeight - treeHeight * scale) / 2;

    applyTransform();
  };

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      const factor = Math.exp(-event.deltaY * 0.0015);

      zoomAt(event.clientX, event.clientY, scale * factor);
    },
    { passive: false }
  );

  /* =======================================================
     DRAG AND PINCH
     ======================================================= */

  const getPinch = () => {
    const [a, b] = [...pointers.values()];

    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      distance: Math.hypot(a.x - b.x, a.y - b.y),
    };
  };

  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".skills-tree-control")) return;

    if (event.pointerType === "mouse" && event.button !== 0) return;

    viewport.setPointerCapture(event.pointerId);

    pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    viewport.classList.add("is-dragging");

    if (pointers.size === 1) {
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
      };

      lastPinch = null;
    } else if (pointers.size === 2) {
      lastPinch = getPinch();
      lastPointer = null;
    }
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointers.size === 1 && lastPointer) {
      translateX += event.clientX - lastPointer.x;
      translateY += event.clientY - lastPointer.y;

      lastPointer = {
        x: event.clientX,
        y: event.clientY,
      };

      applyTransform();
    } else if (pointers.size === 2) {
      const pinch = getPinch();

      if (lastPinch && lastPinch.distance > 0) {
        translateX += pinch.x - lastPinch.x;
        translateY += pinch.y - lastPinch.y;

        zoomAt(pinch.x, pinch.y, (scale * pinch.distance) / lastPinch.distance);
      }

      lastPinch = pinch;
    }
  });

  const endPointer = (event) => {
    if (!pointers.has(event.pointerId)) return;

    pointers.delete(event.pointerId);

    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    if (pointers.size === 0) {
      lastPointer = null;
      lastPinch = null;
      viewport.classList.remove("is-dragging");
    } else if (pointers.size === 1) {
      lastPointer = {
        ...pointers.values().next().value,
      };

      lastPinch = null;
    }
  };

  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);
  viewport.addEventListener("lostpointercapture", endPointer);

  /* =======================================================
     CONTROLS
     ======================================================= */

  const controls = document.createElement("div");
  controls.className = "skills-tree-controls";

  const createButton = (iconName, title, action) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "skills-tree-control";
    button.dataset.action = action;
    button.setAttribute("aria-label", title);
    button.title = title;

    const icon = createIcon(iconName);
    if (icon) button.appendChild(icon);

    controls.appendChild(button);
    return button;
  };

  const zoomInButton = createButton("zoomIn", "Zoom in", "zoom-in");

  const zoomOutButton = createButton("zoomOut", "Zoom out", "zoom-out");

  const fitButton = createButton("fit", "Fit tree to view", "fit");

  zoomInButton.addEventListener("click", () => zoomCenter(1.25));

  zoomOutButton.addEventListener("click", () => zoomCenter(1 / 1.25));

  fitButton.addEventListener("click", fitToView);

  viewport.appendChild(controls);

  const hint = document.createElement("p");
  hint.className = "skills-tree-hint";
  hint.textContent = "Scroll to zoom · Drag to explore";
  viewport.appendChild(hint);

  /* =======================================================
     INITIALIZATION
     ======================================================= */

  const refresh = () => {
    if (!viewport.clientWidth || !viewport.clientHeight) return;

    layoutTree();
    fitToView();
  };

  refresh();

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(refresh);
    observer.observe(viewport);
  } else {
    window.addEventListener("resize", refresh);
  }
});
