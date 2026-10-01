/**
 * dsa/MessageQueue.js
 *
 * Classic FIFO (First-In, First-Out) Queue Data Structure for chat messaging.
 * Uses linked list nodes to ensure O(1) enqueue and O(1) dequeue operations.
 */

class QueueNode {
  constructor(item) {
    this.value = item;
    this.next = null;
  }
}

export class MessageQueue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * Enqueue: Adds an item to the end of the queue.
   * Time Complexity: O(1)
   */
  enqueue(item) {
    const newNode = new QueueNode(item);
    if (!this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size += 1;
    return this.size;
  }

  /**
   * Dequeue: Removes and returns the item from the front of the queue.
   * Time Complexity: O(1)
   */
  dequeue() {
    if (!this.head) return null;
    const removedValue = this.head.value;
    this.head = this.head.next;
    if (!this.head) {
      this.tail = null;
    }
    this.size -= 1;
    return removedValue;
  }

  /**
   * Peek: Returns the item at the front without removing it.
   */
  peek() {
    return this.head ? this.head.value : null;
  }

  /**
   * Checks if the queue is empty.
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * Returns current queue elements as array (for UI inspection/render).
   */
  toArray() {
    const items = [];
    let current = this.head;
    while (current) {
      items.push(current.value);
      current = current.next;
    }
    return items;
  }

  /**
   * Clear all items in queue.
   */
  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
}
