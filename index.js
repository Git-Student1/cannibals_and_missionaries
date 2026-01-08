import { SVG } from "https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js/+esm";
import {cannibal_problem} from "./cannibal_problem.js";
const stopGoButtonId = "go_stop"
const resultLabelId =  "result"



document.getElementById(stopGoButtonId).onclick = start_animation;
const draw = SVG().addTo('#drawing')
let run = false;



//-------------- THIS IS THE MAIN LOOP, AS SUCH IT IS NOT ENTIRELY PURE --------------------------
async function start_animation() {
    //not pure because document control is needed
    //not pure as stopGoButtonId is needed to prevent code duplication and stopGoButtonID cannot be passed in as a parameter since it is saved in the script and thus not provided by the calling HTML button
    function go_stop() {
        run = !run;
        if (run === false) {
            document.getElementById(stopGoButtonId).innerText = "continue"
        } else {
            document.getElementById(stopGoButtonId).innerText = "stop"
        }
    }

    console.log("setup initialised")
    document.getElementById(stopGoButtonId).innerText = "stop"
    document.getElementById(stopGoButtonId).onclick = go_stop;

    const n_cannibals = document.getElementById('cannibal_count').value;
    const boat_capacity = document.getElementById('boat_capacity').value;


    const beach_dimensions = {
        height: 1000,
        width: 300,
        center_x: function(){
            return this.x_offset + this.width/2;
        },
        center_y: function(){
            return this.y_offset + this.height/2;
        }
    }

    const start_beach_properties = {
        ...beach_dimensions,
        x_offset: 0,
        y_offset: 0,
    }
    const goal_beach_properties = {
        ...beach_dimensions,
        x_offset: 1000,
        y_offset: 0,
    }
    const river_properties = {
        height: beach_dimensions.height,
        width: goal_beach_properties.x_offset - start_beach_properties.x_offset - start_beach_properties.width,
        y_offset: 0,
        x_offset: start_beach_properties.x_offset + start_beach_properties.width
    }

    const boat_width = river_properties.width/3
    const boat_height = boat_width/2
    const boat_properties = {
        height: boat_height,
        width: boat_width,
        y_offset: start_beach_properties.center_y() - boat_height/2,
        x_offset: river_properties.x_offset
    }


    function create_drawn_obj(properties, color){
        return {body:draw.rect({
            width: properties.width,
            height: properties.height,
            x:properties.x_offset,
            y:properties.y_offset}).fill(color)};
    }
    function create_boat(properties, color, river_properties, move_duration, move_delay) {
        let boat = create_drawn_obj(properties, color)
        let start_x = river_properties.x_offset
        let end_x = river_properties.x_offset + river_properties.width -  properties.width
        let path_length = end_x-start_x
        boat.is_at_start = true
        boat.center_x = function (){
            return boat.body.attr("x") + boat.body.attr("width")/2
        }
        boat.first_row_y = function (){
            return boat.body.attr("y") + boat.body.attr("height")/4
        }
        boat.second_row_y = function (){
            return boat.body.attr("y") + boat.body.attr("height")*3/4
        }
        boat.width =  function (){ return boat.body.attr("width")}

        boat.next_x_move = function (){
            if (boat.is_at_start){
                return path_length
            }
            return -path_length
        }

        boat.move = function(){
            boat.body.animate({
                duration: move_duration,
                when: 'now',})
                .dmove(boat.next_x_move(), 0)
        }
        return boat
    }

    const start_beach = create_drawn_obj(start_beach_properties, "yellow")
    const goal_beach = create_drawn_obj(goal_beach_properties, "yellow")
    const river = create_drawn_obj(river_properties, "blue")

    const boat =  create_boat(boat_properties, "brown", river_properties, 1000)


    const people_size = boat_width/(n_cannibals*2);




    function createDrawnPerson(draw, max_size, is_cannibal, color) {
        function createDrawnBody(draw, diameter) {
            return draw.circle(diameter).fill(color)
        }
        const elemBody = createDrawnBody(draw, max_size)
        return {
            is_cannibal:is_cannibal,
            body:elemBody
        }
    }

    function createDrawnPeople(draw, x_center, y_center, diameter, n, color){
        const elements = []
        for (let i = 0; i < n; i++) {
            elements[elements.length] = createDrawnPerson(draw, diameter, true,  color );
        }
        return elements
    }

    function positionPeople(people, x_center, y_center,  space_in_between) {
        console.log("people", people)
        const start_y = y_center - (people.length/2)*space_in_between
        for (let i = 0; i < people.length; i++) {
            const x = x_center
            const y = start_y + i*space_in_between
            people[i].body.center(x, y);
        }
    }



    function position_people_on_beach(cannibals, missionaries, beach_properties, space_in_between) {

        positionPeople(cannibals, beach_properties.center_x(), beach_properties.center_y(),space_in_between)
        positionPeople(missionaries,beach_properties.center_x()+space_in_between, beach_properties.center_y(), space_in_between)
    }




    const cannibals_start = createDrawnPeople(draw, start_beach_properties.center_x(), start_beach_properties.center_y(), people_size, n_cannibals, "red")
    const missionaries_start =  createDrawnPeople(draw, start_beach_properties.center_x()+people_size*1.2, start_beach_properties.center_y(), people_size, n_cannibals, "blue")
    const space_in_between_people = people_size*1.2
    position_people_on_beach(cannibals_start, missionaries_start, start_beach_properties, space_in_between_people)

    const cannibals_goal = []
    const missionaries_goal = []

    run = true
    let steps = cannibal_problem(n_cannibals, n_cannibals, boat_capacity)
    steps.shift()

    function move_boat(boat, passengers){
        function move(drawn_obj, movement_x){
            drawn_obj.animate({
                duration: 1000,
                when: 'now',})
                .dmove(movement_x, 0)
        }
        const x_movement = boat.next_x_move()
        move(boat.body, x_movement)
        for (const passenger of passengers) {
            move(passenger.body, x_movement)
        }
    }

    function move_passengers_to_boat(boat, passengers){
        let i = -passengers.length/2
        for (const passenger of  passengers){
            const x = boat.center_x() + ((boat.width()*0.8)/(passengers.length +2))*i
            const y = boat.first_row_y()
            const x_diff =  passenger.body.attr("x") - x
            const y_diff =  passenger.body.attr("y") - y
            passenger.body.center(x, y)
            i++
        }
    }



    function transfer_people(){

    }

    console.log("start cannibals-and-missionaries animation")
    while (steps.length > 0) {

        await sleep(2000)
        if (run) {
            console.log("next step")
            const step = steps.shift()

            const boat_action = step.boat
            console.log(step)
            if (boat.is_at_start){
                const c_transport = boat_action.c
                const m_transport = boat_action.m

                const moving_cannibals =  cannibals_start.splice(cannibals_start.length - c_transport, cannibals_start.length)
                const moving_missionaries =  missionaries_start.splice(missionaries_start.length - m_transport, missionaries_start.length)
                const passengers = moving_cannibals.concat(moving_missionaries)
                move_passengers_to_boat(boat, passengers)
                move_boat(boat, passengers)

                missionaries_goal.push(...moving_missionaries)
                cannibals_goal.push(...moving_cannibals)
                await sleep(1000)
                position_people_on_beach(missionaries_goal, cannibals_goal, goal_beach_properties, space_in_between_people)

            }
            else{

            }

            boat.is_at_start = !boat.is_at_start


        }
    }



    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}